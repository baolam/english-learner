import sys
import io
import os
import torch
import redis.asyncio as redis
from dotenv import load_dotenv

# Ensure Windows stdout handles UTF-8 properly with line buffering
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', line_buffering=True)
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.from_url(REDIS_URL)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"[Config] Compute Device initialized: {DEVICE}")

# Gemini API Key Setup (Prepared for future Gemini LLM integration)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def get_gemini_config() -> dict:
    """Returns the current Gemini API Key configuration status."""
    return {
        "gemini_api_key_configured": bool(GEMINI_API_KEY and GEMINI_API_KEY != "your-gemini-api-key"),
        "key_preview": f"{GEMINI_API_KEY[:4]}...{GEMINI_API_KEY[-4:]}" if len(GEMINI_API_KEY) > 8 else "Not Configured"
    }

