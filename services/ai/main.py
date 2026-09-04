import sys
import io

# Fix unicode print on Windows cmd AND ensure it flushes immediately (line_buffering=True)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', line_buffering=True)

import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import tempfile
import shutil
import asyncio
import json
import base64
import redis.asyncio as redis
from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from winsdk.windows.media.ocr import OcrEngine
from winsdk.windows.globalization import Language
from winsdk.windows.graphics.imaging import BitmapDecoder
from winsdk.windows.storage import StorageFile, FileAccessMode
from llm_service import LlamaService
import whisper
from pydantic import BaseModel
import torch
from dotenv import load_dotenv

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(redis_ocr_worker())
    yield

app = FastAPI(title="AI Service API", description="API for OCR and Whisper with Streaming", lifespan=lifespan)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.from_url(REDIS_URL)

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

print("Loading Llama model...")
try:
    llama_service = LlamaService()
except Exception as e:
    print(f"[WARNING] Cannot load Llama model (C++/CUDA error): {e}")
    llama_service = None

async def run_windows_ocr(image_path: str, lang_code: str = 'en-US'):
    abs_path = os.path.abspath(image_path)
    file = await StorageFile.get_file_from_path_async(abs_path)
    stream = await file.open_async(FileAccessMode.READ)
    decoder = await BitmapDecoder.create_async(stream)
    software_bitmap = await decoder.get_software_bitmap_async()
    
    lang = Language(lang_code)
    if not OcrEngine.is_language_supported(lang):
        raise Exception(f"Language {lang_code} is not supported by Windows OCR. Please install it in Windows Settings.")
        
    engine = OcrEngine.try_create_from_language(lang)
    result = await engine.recognize_async(software_bitmap)
    return result.text

print("Loading Whisper model...")
whisper_model = whisper.load_model("base", device=device)

class TextPayload(BaseModel):
    text: str

# ---------------------------------------------------------
# 1. STREAMING FILE UPLOAD (Giảm tải RAM cho file lớn)
# ---------------------------------------------------------
@app.post("/api/ocr")
async def process_ocr(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
    
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
            
        text = await run_windows_ocr(tmp_path, lang_code='en-US')
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.post("/api/whisper")
async def process_whisper(file: UploadFile = File(...)):
    if not file.content_type.startswith("audio/") and not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be audio or video.")
        
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
            
        # Dùng asyncio.to_thread để không block event loop của FastAPI
        result = await asyncio.to_thread(whisper_model.transcribe, tmp_path)
        return {"text": result["text"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

import wave
import json

# ---------------------------------------------------------
# 2. REAL-TIME WEBSOCKET STREAMING (Nói tới đâu dịch tới đó)
# ---------------------------------------------------------
@app.websocket("/api/whisper/stream")
async def whisper_stream(websocket: WebSocket):
    await websocket.accept()
    audio_buffer = bytearray()
    
    # Mặc định là webm cho web frontend
    current_format = "webm"
    channels = 2
    samplerate = 44100
    
    try:
        while True:
            # Nhận dữ liệu từ client (Frontend/App)
            message = await websocket.receive()
            
            if message.get("type") == "websocket.disconnect":
                break
                
            # Nếu client gửi luồng nhị phân (Binary Audio Chunks từ Microphone)
            if message.get("bytes") is not None:
                audio_buffer.extend(message["bytes"])
                
            # Nếu client gửi text command
            elif message.get("text") is not None:
                text_data = message["text"]
                try:
                    # Kiểm tra xem có phải JSON config không
                    config = json.loads(text_data)
                    if "format" in config:
                        current_format = config["format"]
                        channels = config.get("channels", 2)
                        samplerate = config.get("samplerate", 44100)
                        print(f"Updated audio format to: {current_format}")
                        continue
                        
                    # Lệnh TRANSCRIBE nằm trong JSON
                    command = config.get("text", "")
                except json.JSONDecodeError:
                    command = text_data
                    
                if command == "TRANSCRIBE" and len(audio_buffer) > 0:
                    tmp_path = None
                    # Copy and clear buffer immediately so we don't lose new chunks while transcribing
                    current_audio = bytearray(audio_buffer)
                    audio_buffer.clear()
                    try:
                        if current_format == "pcm":
                            # Lưu thành file WAV bằng module wave có sẵn
                            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
                                tmp_path = tmp.name
                            with wave.open(tmp_path, 'wb') as wf:
                                wf.setnchannels(channels)
                                wf.setsampwidth(2) # 16-bit = 2 bytes
                                wf.setframerate(samplerate)
                                wf.writeframes(current_audio)
                        else:
                            # Mặc định là WebM từ Web
                            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
                                tmp.write(current_audio)
                                tmp_path = tmp.name
                        
                        # Dùng asyncio.to_thread để tránh block kết nối của các user khác
                        result = await asyncio.to_thread(whisper_model.transcribe, tmp_path)
                        await websocket.send_json({"text": result["text"]})
                    except Exception as e:
                        await websocket.send_json({"error": str(e)})
                    finally:
                        if tmp_path and os.path.exists(tmp_path):
                            os.remove(tmp_path)
                        
    except WebSocketDisconnect:
        print("Client disconnected from WebSocket")

# ---------------------------------------------------------
# 3. LLM CHAT API
# ---------------------------------------------------------
class ChatRequest(BaseModel):
    prompt: str

@app.post("/api/chat")
async def process_chat(req: ChatRequest):
    if llama_service is None:
        raise HTTPException(status_code=500, detail="Llama model failed to load during startup.")
    try:
        # Sử dụng asyncio.to_thread để tránh block event loop
        response = await asyncio.to_thread(llama_service.generate_response, req.prompt)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def redis_ocr_worker():
    print("[Redis Worker] Started listening to 'ocr_tasks'...")
    while True:
        try:
            # blpop blocks until an item is available
            result = await redis_client.blpop("ocr_tasks", timeout=0)
            if result:
                queue_name, message = result
                data = json.loads(message)
                
                task_id = data.get("task_id")
                image_base64 = data.get("image_base64")
                
                print(f"[Redis Worker] Processing task {task_id}")
                
                if image_base64:
                    image_bytes = base64.b64decode(image_base64)
                    
                    tmp_path = None
                    try:
                        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
                            tmp.write(image_bytes)
                            tmp_path = tmp.name
                            
                        text = await run_windows_ocr(tmp_path, lang_code='en-US')
                        
                        # Push result back to ai_results queue
                        result_payload = {
                            "task_id": task_id,
                            "type": "screen",
                            "result_text": text,
                            "status": "success"
                        }
                        await redis_client.publish("ai_results", json.dumps(result_payload))
                        print(f"[Redis Worker] Task {task_id} completed successfully. Result: {text}")
                        
                    except Exception as e:
                        print(f"[Redis Worker] Error processing task {task_id}: {e}")
                        error_payload = {
                            "task_id": task_id,
                            "type": "screen",
                            "error": str(e),
                            "status": "error"
                        }
                        await redis_client.publish("ai_results", json.dumps(error_payload))
                    finally:
                        if tmp_path and os.path.exists(tmp_path):
                            os.remove(tmp_path)
                            
        except Exception as e:
            print(f"[Redis Worker] Error in worker loop: {e}")
            await asyncio.sleep(1)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
