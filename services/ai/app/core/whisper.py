import whisper
from app.config import DEVICE

WHISPER_MODEL_SIZE = "base"

_whisper_model = None

def _get_model():
    global _whisper_model
    if _whisper_model is None:
        print(f"[Whisper] Loading '{WHISPER_MODEL_SIZE}' model on {DEVICE} (first use)...")
        _whisper_model = whisper.load_model(WHISPER_MODEL_SIZE, device=DEVICE)
    return _whisper_model

def transcribe_audio_file(file_path: str) -> str:
    """Transcribes an audio or video file using OpenAI Whisper. Loads the model lazily on first call."""
    result = _get_model().transcribe(file_path)
    return result.get("text", "")
