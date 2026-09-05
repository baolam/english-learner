from fastapi import APIRouter
from app.api.endpoints.ai import router as ai_router
from app.api.endpoints.ocr import router as ocr_router
from app.api.endpoints.whisper import router as whisper_router

api_router = APIRouter()

api_router.include_router(ai_router)
api_router.include_router(ocr_router)
api_router.include_router(whisper_router)
