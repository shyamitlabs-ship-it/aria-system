import os
from gtts import gTTS
import tempfile

def generate_confirmation_message(ticket_id: str, customer: str, dept: str) -> str:
    """Generate confirmation message text."""
    return (
        f"Thank you {customer}. Your request has been successfully registered. "
        f"Your ticket ID is {ticket_id}. "
        f"Our {dept} will reach out to you shortly. "
        f"Have a great day!"
    )

def text_to_speech(text: str) -> bytes:
    """Convert text to speech using gTTS and return audio bytes."""
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp_path = tmp.name

    tts = gTTS(text=text, lang="en", slow=False)
    tts.save(tmp_path)

    with open(tmp_path, "rb") as f:
        audio_bytes = f.read()

    os.unlink(tmp_path)
    return audio_bytes

def get_aria_greeting() -> str:
    """ARIA's opening greeting."""
    return (
        "Thank you for calling. This is ARIA, your automated support assistant. "
        "Is your call regarding a Service Issue, Billing Dispute, "
        "Product Support, Sales Enquiry, Incident Report, or a Complaint?"
    )