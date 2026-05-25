import os
import time
import random
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from supabase import create_client
from services.extraction import detect_category, extract_fields, generate_aria_response
from services.routing import route_ticket
from services.confirmation import get_aria_greeting, text_to_speech
from fastapi.responses import Response
from twilio.twiml.voice_response import VoiceResponse, Gather
from twilio.rest import Client as TwilioClient

router = APIRouter()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY"),
)

CATEGORIES_MAP = {
    "billing":   { "dept": "Finance & Billing Team" },
    "incident":  { "dept": "Technical Team" },
    "service":   { "dept": "Service Delivery Team" },
    "support":   { "dept": "Product Support Team" },
    "sales":     { "dept": "Sales Team" },
    "complaint": { "dept": "Customer Relations Team" },
}

CATEGORY_FIELDS = {
    "billing":   ["customerName", "accountNumber", "disputedAmount", "transactionDate", "disputeReason", "invoiceReference"],
    "incident":  ["customerName", "contact", "affectedSystem", "severity", "incidentDescription", "businessImpact"],
    "service":   ["customerName", "contact", "requestType", "description", "priority", "preferredDate"],
    "support":   ["customerName", "contact", "productName", "purchaseDate", "problemDescription", "troubleshooting"],
    "sales":     ["customerName", "company", "contact", "productInterest", "budgetRange", "timeline"],
    "complaint": ["customerName", "contact", "complaintType", "previousTicket", "complaintDescription", "resolutionExpected"],
}


class StartCallRequest(BaseModel):
    call_id: str


class TranscriptRequest(BaseModel):
    call_id: str
    customer_message: str


NGROK_URL = "https://aria-system-production.up.railway.app"


@router.post("/start")
def start_call(req: StartCallRequest):
    greeting = get_aria_greeting()
    supabase.table("calls").insert({
        "id": req.call_id,
        "category": "unknown",
        "stage": "greeting",
        "duration": 0,
        "customer": "",
        "filled_fields": {},
        "transcript": [{"role": "aria", "text": greeting}],
    }).execute()
    return {
        "call_id": req.call_id,
        "aria_response": greeting,
        "stage": "greeting",
    }


@router.post("/message")
def process_message(req: TranscriptRequest):
    result = supabase.table("calls").select("*").eq("id", req.call_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Call not found")

    call = result.data[0]
    transcript = call["transcript"]
    filled_fields = call["filled_fields"] or {}
    category = call["category"]

    transcript.append({"role": "customer", "text": req.customer_message})

    transcript_text = "\n".join([
        f"{'ARIA' if t['role'] == 'aria' else 'Customer'}: {t['text']}"
        for t in transcript
    ])

    if category == "unknown":
        category = detect_category(transcript_text)
        stage = "formFilling"
    else:
        stage = call["stage"]

    fields = CATEGORY_FIELDS.get(category, [])
    extracted = extract_fields(transcript_text, category, fields)

    for key, value in extracted.items():
        if value and key not in filled_fields:
            filled_fields[key] = value

    missing_fields = [f for f in fields if f not in filled_fields or not filled_fields[f]]

    if missing_fields:
        aria_response = generate_aria_response(transcript_text, category, missing_fields)
        stage = "formFilling"
    else:
        aria_response = (
            "Thank you. Let me confirm your details — "
            "I have all the information needed. "
            "Your request will be routed to the appropriate team. "
            "Is there anything else you'd like to add?"
        )
        stage = "confirmation"

    transcript.append({"role": "aria", "text": aria_response})

    issue_text = (
        filled_fields.get("incidentDescription") or
        filled_fields.get("disputeReason") or
        filled_fields.get("problemDescription") or
        filled_fields.get("complaintDescription") or
        filled_fields.get("description") or
        req.customer_message
    )

    routing = route_ticket(issue_text)

    supabase.table("calls").update({
        "category": category,
        "stage": stage,
        "customer": filled_fields.get("customerName", ""),
        "filled_fields": filled_fields,
        "transcript": transcript,
    }).eq("id", req.call_id).execute()

    return {
        "call_id": req.call_id,
        "aria_response": aria_response,
        "category": category,
        "stage": stage,
        "filled_fields": filled_fields,
        "missing_fields": missing_fields,
        "routing": routing,
    }


@router.post("/tts")
def get_tts(body: dict):
    text = body.get("text", "")
    audio_bytes = text_to_speech(text)
    return Response(content=audio_bytes, media_type="audio/mpeg")


@router.post("/trigger")
def trigger_call(body: dict):
    """Trigger an outbound call from Twilio to a phone number."""
    phone_number = body.get("phone_number")
    if not phone_number:
        raise HTTPException(status_code=400, detail="phone_number required")

    twilio_client = TwilioClient(
        os.getenv("TWILIO_ACCOUNT_SID"),
        os.getenv("TWILIO_AUTH_TOKEN"),
    )

    call = twilio_client.calls.create(
        to=phone_number,
        from_=os.getenv("TWILIO_PHONE_NUMBER"),
        url=f"{NGROK_URL}/api/calls/webhook/incoming",
    )

    return { "call_sid": call.sid, "status": call.status }


@router.post("/webhook/incoming")
async def incoming_call(request: Request):
    response = VoiceResponse()
    call_id = f"CALL-{int(time.time())}"
    greeting = get_aria_greeting()

    supabase.table("calls").insert({
        "id": call_id,
        "category": "unknown",
        "stage": "greeting",
        "duration": 0,
        "customer": "",
        "filled_fields": {},
        "transcript": [{"role": "aria", "text": greeting}],
    }).execute()

    gather = Gather(
        input="speech",
        action=f"{NGROK_URL}/api/calls/webhook/respond?call_id={call_id}",
        timeout=5,
        speech_timeout="auto",
        language="en-IN",
    )
    gather.say(greeting, voice="Polly.Aditi")
    response.append(gather)

    return Response(content=str(response), media_type="application/xml")


@router.post("/webhook/respond")
async def respond_to_speech(request: Request):
    form = await request.form()
    speech_result = form.get("SpeechResult", "")
    call_id = request.query_params.get("call_id")

    response = VoiceResponse()

    if not speech_result or not call_id:
        gather = Gather(
            input="speech",
            action=f"{NGROK_URL}/api/calls/webhook/respond?call_id={call_id}",
            timeout=5,
            speech_timeout="auto",
            language="en-IN",
        )
        gather.say("I'm sorry, I didn't catch that. Could you please repeat?", voice="Polly.Aditi")
        response.append(gather)
        return Response(content=str(response), media_type="application/xml")

    req = TranscriptRequest(call_id=call_id, customer_message=speech_result)
    result = process_message(req)

    aria_response = result.get("aria_response", "Thank you, let me process that.")
    stage = result.get("stage", "formFilling")

    if stage == "confirmation":
        gather = Gather(
            input="speech",
            action=f"{NGROK_URL}/api/calls/webhook/complete?call_id={call_id}",
            timeout=5,
            speech_timeout="auto",
            language="en-IN",
        )
        gather.say(aria_response, voice="Polly.Aditi")
        response.append(gather)
    else:
        gather = Gather(
            input="speech",
            action=f"{NGROK_URL}/api/calls/webhook/respond?call_id={call_id}",
            timeout=5,
            speech_timeout="auto",
            language="en-IN",
        )
        gather.say(aria_response, voice="Polly.Aditi")
        response.append(gather)

    return Response(content=str(response), media_type="application/xml")


@router.post("/webhook/complete")
async def complete_call(request: Request):
    call_id = request.query_params.get("call_id")
    response = VoiceResponse()

    result = supabase.table("calls").select("*").eq("id", call_id).execute()
    if not result.data:
        response.say("Thank you for calling. Goodbye.", voice="Polly.Aditi")
        return Response(content=str(response), media_type="application/xml")

    call = result.data[0]
    filled = call.get("filled_fields", {})
    category = call.get("category", "service")
    dept = CATEGORIES_MAP.get(category, {}).get("dept", "Support Team")

    ticket_id = f"TKT-{random.randint(1000, 9999)}"

    supabase.table("tickets").insert({
        "id": ticket_id,
        "customer": filled.get("customerName", "Unknown"),
        "contact": filled.get("contact", filled.get("accountNumber", "—")),
        "category": category,
        "dept": dept,
        "status": "Open",
        "priority": "Medium",
        "time": datetime.now().strftime("%I:%M %p"),
        "duration": "—",
        "filled_fields": filled,
        "routing_confidence": 0.94,
        "confirmation_sent": True,
    }).execute()

    supabase.table("calls").delete().eq("id", call_id).execute()

    farewell = (
        f"Thank you. Your ticket {ticket_id} has been created "
        f"and routed to our {dept}. "
        f"You will receive a confirmation shortly. Have a great day!"
    )
    response.say(farewell, voice="Polly.Aditi")

    return Response(content=str(response), media_type="application/xml")


@router.get("/{call_id}")
def get_call(call_id: str):
    result = supabase.table("calls").select("*").eq("id", call_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Call not found")
    return result.data[0]