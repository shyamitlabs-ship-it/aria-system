from dotenv import load_dotenv
load_dotenv()
import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are ARIA, an intelligent customer service AI agent.
Your job is to extract structured information from customer conversations.
Always respond with valid JSON only. No explanation, no markdown, no backticks.

Extract whatever fields are available from the conversation.
If a field is not mentioned, set it to null.
"""

def detect_category(transcript: str) -> str:
    """Detect call category from transcript."""
    prompt = f"""Based on this conversation, classify it into exactly one of these categories:
billing, incident, service, support, sales, complaint

Conversation:
{transcript}

Respond with just the category word, nothing else."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a classifier. Respond with one word only."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=10,
    )
    return response.choices[0].message.content.strip().lower()


def extract_fields(transcript: str, category: str, fields: list) -> dict:
    """Extract form fields from transcript using Llama 3."""
    field_list = "\n".join([f"- {f}" for f in fields])

    prompt = f"""Extract the following fields from this customer service conversation.
Category: {category}

Fields to extract:
{field_list}

Conversation:
{transcript}

Return a JSON object with the field names as keys (camelCase) and extracted values as strings.
If a field is not found, set it to null.
Respond with JSON only."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,
    )

    raw = response.choices[0].message.content.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


def generate_aria_response(transcript: str, category: str, missing_fields: list) -> str:
    """Generate ARIA's next conversational response to extract missing fields."""
    missing = ", ".join(missing_fields)

    prompt = f"""You are ARIA, a professional and friendly AI customer service agent.
You are handling a {category} call.

Conversation so far:
{transcript}

You still need to collect: {missing}

Generate your next response to naturally extract the first missing field.
Be conversational, professional, and concise.
Respond with just your next message, nothing else."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are ARIA, a professional AI customer service agent."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=150,
    )

    return response.choices[0].message.content.strip()