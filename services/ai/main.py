import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.api.router import api_router
from app.workers.redis_worker import redis_ocr_worker

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(redis_ocr_worker())
    yield

app = FastAPI(
    title="AI Service API",
    description="Modular API for OCR, Whisper, NLTK Grammar, and Llama Structured Outputs",
    lifespan=lifespan
)

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
