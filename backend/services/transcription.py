import whisper
import tempfile
import os

model = whisper.load_model("base")

def transcribe_audio(audio_bytes: bytes) -> str:
    """
    Takes raw audio bytes, saves to temp file,
    runs Whisper transcription, returns text.
    """
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        result = model.transcribe(tmp_path, language="en")
        return result["text"].strip()
    finally:
        os.unlink(tmp_path)