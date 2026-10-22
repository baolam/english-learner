import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import queue
import threading

from app.schemas.ai import (
    ChatRequest,
    TermExplainPayload,
    GrammarParsePayload,
    FlashcardPayload,
    ExtractTermsPayload,
    SummarizePayload,
    SetModelPayload
)
from app.core.llama import LlamaService
from app.core.nltk_parser import NLTKGrammarParser
from app.core.hybrid_router import HybridAIRouter

router = APIRouter(tags=["AI Services"])

print("[AI Endpoints] Initializing Hybrid AIRouter...")
nltk_parser = NLTKGrammarParser()

try:
    llama_service = LlamaService()
except Exception as e:
    print(f"[WARNING] Cannot load Llama model directly: {e}")
    llama_service = None

hybrid_router = HybridAIRouter(llama_service=llama_service, nltk_parser=nltk_parser)

@router.get("/api/ai/model-info")
async def get_model_info_endpoint():
    status = hybrid_router.get_router_status()
    if llama_service is not None:
        status.update(llama_service.get_model_info())
    return status

@router.post("/api/ai/set-model")
async def set_model_endpoint(payload: SetModelPayload):
    if llama_service is None:
        raise HTTPException(status_code=500, detail="Llama service is unavailable.")
    try:
        res = await asyncio.to_thread(llama_service.switch_model, payload.model_size)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/chat")
async def process_chat(req: ChatRequest):
    prompt = req.get_effective_prompt()
    if not prompt:
        raise HTTPException(status_code=400, detail="Missing chat prompt or message.")
    
    try:
        result = await asyncio.to_thread(
            hybrid_router.chat,
            prompt,
            history=req.history,
            mode=req.mode or "auto",
            heavy=req.heavy or req.prefer_cloud or False
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/chat/stream")
async def process_chat_stream(req: ChatRequest):
    prompt = req.get_effective_prompt()
    if not prompt:
        raise HTTPException(status_code=400, detail="Missing chat prompt or message.")
    
    # Check if router should stream local vs fallback API
    use_llama = (req.mode != "api" and not req.heavy and llama_service is not None)
    
    if not use_llama:
        # Generate complete response via HybridRouter and yield as single stream
        res = await asyncio.to_thread(hybrid_router.chat, prompt, history=req.history, mode=req.mode or "auto", heavy=req.heavy)
        async def text_stream():
            yield res.get("response", "")
        return StreamingResponse(text_stream(), media_type="text/plain")

    try:
        q = queue.Queue()
        def run_stream():
            try:
                for chunk in llama_service.generate_stream(prompt, history=req.history):
                    q.put(chunk)
            finally:
                q.put(None)
                
        t = threading.Thread(target=run_stream)
        t.start()
        
        async def generate():
            while True:
                chunk = await asyncio.to_thread(q.get)
                if chunk is None:
                    break
                yield chunk

        return StreamingResponse(generate(), media_type="text/plain")
    except Exception as e:
        # Fallback stream
        res = await asyncio.to_thread(hybrid_router.chat, prompt, history=req.history, mode="api")
        async def fallback_stream():
            yield res.get("response", "")
        return StreamingResponse(fallback_stream(), media_type="text/plain")

@router.post("/api/ai/term-explain")
async def explain_term_endpoint(payload: TermExplainPayload):
    try:
        is_fast = payload.fast or payload.fast_mode or payload.fast_first
        result = await asyncio.to_thread(
            hybrid_router.explain_term,
            payload.term,
            payload.context_sentence,
            mode=payload.mode or "auto",
            fast=is_fast,
            heavy=payload.heavy
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/ai/grammar-parse")
async def grammar_parse_endpoint(payload: GrammarParsePayload):
    try:
        is_fast = payload.fast or payload.fast_mode or payload.fast_first
        result = await asyncio.to_thread(
            hybrid_router.parse_grammar,
            payload.sentence,
            mode=payload.mode or "auto",
            fast=is_fast,
            heavy=payload.heavy
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/ai/flashcard-generate")
async def flashcard_endpoint(payload: FlashcardPayload):
    try:
        is_fast = payload.fast or payload.fast_mode or payload.fast_first
        result = await asyncio.to_thread(
            hybrid_router.generate_flashcard,
            payload.term,
            payload.context_sentence,
            payload.definition,
            mode=payload.mode or "auto",
            fast=is_fast
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/ai/extract-terms")
async def extract_terms_endpoint(payload: ExtractTermsPayload):
    try:
        is_fast = payload.fast or payload.fast_mode or payload.fast_first
        result = await asyncio.to_thread(
            hybrid_router.extract_key_terms,
            payload.text,
            mode=payload.mode or "auto",
            fast=is_fast,
            heavy=payload.heavy
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/ai/summarize-paraphrase")
async def summarize_endpoint(payload: SummarizePayload):
    try:
        is_fast = payload.fast or payload.fast_mode or payload.fast_first
        result = await asyncio.to_thread(
            hybrid_router.summarize_and_paraphrase,
            payload.text,
            mode=payload.mode or "auto",
            fast=is_fast,
            heavy=payload.heavy
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
