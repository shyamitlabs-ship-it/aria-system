import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
from services.routing import route_ticket
from services.confirmation import generate_confirmation_message

router = APIRouter()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY"),
)

class CreateTicketRequest(BaseModel):
    call_id: str
    customer: str
    contact: str
    category: str
    dept: str
    priority: str
    duration: str
    filled_fields: dict


@router.post("/create")
def create_ticket(req: CreateTicketRequest):
    """Create a ticket from a completed call."""
    import random
    from datetime import datetime

    ticket_id = f"TKT-{random.randint(1000, 9999)}"
    time_now = datetime.now().strftime("%I:%M %p")

    ticket = {
        "id": ticket_id,
        "customer": req.customer,
        "contact": req.contact,
        "category": req.category,
        "dept": req.dept,
        "status": "Open",
        "priority": req.priority,
        "duration": req.duration,
        "time": time_now,
        "filled_fields": req.filled_fields,
        "routing_confidence": 0.94,
        "confirmation_sent": True,
    }

    supabase.table("tickets").insert(ticket).execute()

    # Remove call from active calls
    supabase.table("calls").delete().eq("id", req.call_id).execute()

    confirmation = generate_confirmation_message(ticket_id, req.customer, req.dept)

    return {
        "ticket_id": ticket_id,
        "ticket": ticket,
        "confirmation_message": confirmation,
    }


@router.get("/")
def get_tickets():
    """Get all tickets ordered by creation time."""
    result = supabase.table("tickets").select("*").order("created_at", desc=True).execute()
    return result.data


@router.get("/{ticket_id}")
def get_ticket(ticket_id: str):
    """Get a specific ticket."""
    result = supabase.table("tickets").select("*").eq("id", ticket_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return result.data[0]


@router.patch("/{ticket_id}/status")
def update_status(ticket_id: str, body: dict):
    """Update ticket status."""
    status = body.get("status")
    if status not in ["Open", "In Progress", "Resolved"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    supabase.table("tickets").update({"status": status}).eq("id", ticket_id).execute()
    return {"ticket_id": ticket_id, "status": status}