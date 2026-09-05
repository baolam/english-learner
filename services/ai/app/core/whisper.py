import whisper
from app.config import DEVICE

print("Loading Whisper model...")
whisper_model = whisper.load_model("base", device=DEVICE)

def transcribe_audio_file(file_path: str) -> str:
    """Transcribes an audio or video file using OpenAI Whisper."""
    result = whisper_model.transcribe(file_path)
    return result.get("text", "")
