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
from app.core.fast_algorithms import FastAIProcessor

router = APIRouter(tags=["AI Services"])

print("Loading NLTK Grammar Parser...")
nltk_parser = NLTKGrammarParser()
fast_processor = FastAIProcessor(nltk_parser)

print("Loading Llama model...")
try:
    llama_service = LlamaService()
except Exception as e:
    print(f"[WARNING] Cannot load Llama model: {e}")
    llama_service = None

@router.get("/api/ai/model-info")
async def get_model_info_endpoint():
    if llama_service is None:
        raise HTTPException(status_code=500, detail="Llama service is unavailable.")
    return llama_service.get_model_info()

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
    if llama_service is None:
        raise HTTPException(status_code=500, detail="Llama model is unavailable.")
    try:
        def sync_stream():
            res = ""
            for chunk in llama_service.generate_stream(prompt, history=req.history):
                res += chunk
            return res
            
        response = await asyncio.to_thread(sync_stream)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/chat/stream")
async def process_chat_stream(req: ChatRequest):
    prompt = req.get_effective_prompt()
    if not prompt:
        raise HTTPException(status_code=400, detail="Missing chat prompt or message.")
    if llama_service is None:
        raise HTTPException(status_code=500, detail="Llama model is unavailable.")
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
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/ai/term-explain")
async def explain_term_endpoint(payload: TermExplainPayload):
    is_fast = payload.fast or payload.fast_mode or payload.fast_first
    if is_fast:
        return fast_processor.fast_explain_term(payload.term, payload.context_sentence)

    if llama_service is None:
        raise HTTPException(status_code=500, detail="Llama service is unavailable.")
    try:
        result = await asyncio.to_thread(llama_service.explain_term, payload.term, payload.context_sentence)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/ai/grammar-parse")
async def grammar_parse_endpoint(payload: GrammarParsePayload):
    is_fast = payload.fast or payload.fast_mode or payload.fast_first
    if is_fast:
        return fast_processor.fast_grammar_parse(payload.sentence)

    if llama_service is None:
        raise HTTPException(status_code=500, detail="Llama service is unavailable.")
    try:
        nltk_data = nltk_parser.parse_sentence(payload.sentence)
        result = await asyncio.to_thread(llama_service.parse_grammar_with_nltk, payload.sentence, nltk_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/ai/flashcard-generate")
async def flashcard_endpoint(payload: FlashcardPayload):
    is_fast = payload.fast or payload.fast_mode or payload.fast_first
    if is_fast:
        return fast_processor.fast_generate_flashcard(payload.term, payload.context_sentence, payload.definition)

    if llama_service is None:
        raise HTTPException(status_code=500, detail="Llama service is unavailable.")
    try:
        result = await asyncio.to_thread(llama_service.generate_flashcard, payload.term, payload.context_sentence, payload.definition)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/ai/extract-terms")
async def extract_terms_endpoint(payload: ExtractTermsPayload):
    is_fast = payload.fast or payload.fast_mode or payload.fast_first
    if is_fast:
        return fast_processor.fast_extract_terms(payload.text)

    if llama_service is None:
        raise HTTPException(status_code=500, detail="Llama service is unavailable.")
    try:
        result = await asyncio.to_thread(llama_service.extract_key_terms, payload.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/ai/summarize-paraphrase")
async def summarize_endpoint(payload: SummarizePayload):
    is_fast = payload.fast or payload.fast_mode or payload.fast_first
    if is_fast:
        return fast_processor.fast_summarize_paraphrase(payload.text)

    if llama_service is None:
        raise HTTPException(status_code=500, detail="Llama service is unavailable.")
    try:
        result = await asyncio.to_thread(llama_service.summarize_and_paraphrase, payload.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


