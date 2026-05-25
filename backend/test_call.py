from dotenv import load_dotenv
load_dotenv()
import os
from twilio.rest import Client

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
twilio_number = os.getenv("TWILIO_PHONE_NUMBER")

client = Client(account_sid, auth_token)

# Replace with your verified Indian mobile number
YOUR_NUMBER = "+919597843700"

call = client.calls.create(
    to=YOUR_NUMBER,
    from_=twilio_number,
    url="https://steadfast-untrimmed-dining.ngrok-free.dev/api/calls/webhook/incoming",
)

print(f"Call initiated: {call.sid}")