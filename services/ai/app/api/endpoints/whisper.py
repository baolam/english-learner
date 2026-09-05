import os
import tempfile
import shutil
import asyncio
import wave
import json
from fastapi import APIRouter, File, UploadFile, HTTPException, WebSocket, WebSocketDisconnect
from app.core.whisper import transcribe_audio_file

router = APIRouter(tags=["Whisper Speech Recognition"])

@router.post("/api/whisper")
async def process_whisper(file: UploadFile = File(...)):
    if not file.content_type.startswith("audio/") and not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be audio or video.")
        
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
            
        text = await asyncio.to_thread(transcribe_audio_file, tmp_path)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.websocket("/api/whisper/stream")
async def whisper_stream(websocket: WebSocket):
    await websocket.accept()
    audio_buffer = bytearray()
    
    current_format = "webm"
    channels = 2
    samplerate = 44100
    
    try:
        while True:
            message = await websocket.receive()
            
            if message.get("type") == "websocket.disconnect":
                break
                
            if message.get("bytes") is not None:
                audio_buffer.extend(message["bytes"])
                
            elif message.get("text") is not None:
                text_data = message["text"]
                try:
                    config = json.loads(text_data)
                    if "format" in config:
                        current_format = config["format"]
                        channels = config.get("channels", 2)
                        samplerate = config.get("samplerate", 44100)
                        continue
                        
                    command = config.get("text", "")
                except json.JSONDecodeError:
                    command = text_data
                    
                if command == "TRANSCRIBE" and len(audio_buffer) > 0:
                    tmp_path = None
                    current_audio = bytearray(audio_buffer)
                    audio_buffer.clear()
                    try:
                        if current_format == "pcm":
                            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
                                tmp_path = tmp.name
                            with wave.open(tmp_path, 'wb') as wf:
                                wf.setnchannels(channels)
                                wf.setsampwidth(2)
                                wf.setframerate(samplerate)
                                wf.writeframes(current_audio)
                        else:
                            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
                                tmp.write(current_audio)
                                tmp_path = tmp.name
                        
                        text = await asyncio.to_thread(transcribe_audio_file, tmp_path)
                        await websocket.send_json({"text": text})
                    except Exception as e:
                        await websocket.send_json({"error": str(e)})
                    finally:
                        if tmp_path and os.path.exists(tmp_path):
                            os.remove(tmp_path)
                        
    except WebSocketDisconnect:
        print("Client disconnected from WebSocket")
