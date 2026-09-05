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
