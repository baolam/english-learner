import sys
import io

# We will just ensure print has flush=True where needed, or let Python handle it natively with -u
# Removed sys.stdout override which may interfere with multi-threading stdout buffering under Turbo.

import requests
import time
import os
import json
import threading
import websocket
from listener import SystemListener
from dotenv import load_dotenv

# Load biến môi trường từ file .env
load_dotenv()

WEBHOOK_BASE_URL = os.getenv("WEBHOOK_BASE_URL", "http://127.0.0.1:3000")
WS_WHISPER_URL = os.getenv("WS_WHISPER_URL", "ws://localhost:3000/api/whisper/stream")

# Đường dẫn thư mục temp nằm cùng cấp với file main.py
TEMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp")

# Tự động tạo thư mục temp nếu chưa có
os.makedirs(TEMP_DIR, exist_ok=True)

AI_WHISPER_URL = os.getenv("AI_WHISPER_URL", "http://localhost:8000/api/whisper")

def debug_log(msg):
    with open(os.path.join(TEMP_DIR, "debug.log"), "a", encoding="utf-8") as f:
        f.write(msg + "\n")
    print(msg)

def handle_screenshot(image_bytes):
    """Callback xử lý khi có ảnh mới từ Snipping Tool"""
    file_name = "screenshot.png"
    file_path = os.path.join(TEMP_DIR, file_name)
    
    # Ghi đè file cũ (luôn luôn là screenshot.png)
    with open(file_path, "wb") as f:
        f.write(image_bytes)
        
    debug_log(f"[Callback] Saved temporary image (overwrite) at: {file_path}")
    debug_log(f"[Callback] Size: {len(image_bytes)} bytes. Sending Webhook...")
    
    send_webhook(image_bytes, file_name, "input/screen")

def handle_audio(audio_bytes, text_result=""):
    """Callback xử lý khi có file audio hoàn chỉnh để gửi lên Management Server"""
    file_name = "audio.wav"
    file_path = os.path.join(TEMP_DIR, file_name)
    
    # Ghi đè file cũ
    with open(file_path, "wb") as f:
        f.write(audio_bytes)
        
    debug_log(f"[Callback] Saved final audio file at: {file_path}")
    debug_log(f"[Callback] Size: {len(audio_bytes)} bytes. Sending Webhook (Management)...")
    
    extra_data = {'text': text_result} if text_result else {}
    send_webhook(audio_bytes, file_name, "input/sound", extra_data=extra_data)

def handle_audio_transcribe_chunk(audio_bytes):
    """Gửi chunk 10s qua HTTP POST thay vì stream"""
    try:
        files = {'file': ('chunk.wav', audio_bytes, 'audio/wav')}
        res = requests.post(AI_WHISPER_URL, files=files)
        if res.status_code == 200:
            return res.json().get("text", "")
        else:
            debug_log(f"[Whisper API Error] Status: {res.status_code} - {res.text}")
    except Exception as e:
        debug_log(f"[Whisper API Error] Exception: {e}")
    return ""

def handle_audio_stream_chunk(audio_bytes):
    pass

def handle_audio_stream_end():
    return ""

def handle_text(text: str):
    """Callback xử lý khi có text mới gửi (Ctrl+Q)"""
    file_name = "text.txt"
    file_path = os.path.join(TEMP_DIR, file_name)
    
    # Ghi đè file cũ (luôn luôn là text.txt)
    text_bytes = text.encode('utf-8')
    with open(file_path, "wb") as f:
        f.write(text_bytes)
        
    debug_log(f"[Callback] Saved temporary text (overwrite) at: {file_path}")
    debug_log(f"[Callback] Size: {len(text_bytes)} bytes. Sending Webhook...")
    
    # Bắn Webhook lên /input/text
    send_webhook(text_bytes, file_name, "input/text")

def handle_error(error_msg):
    """Callback xử lý lỗi"""
    debug_log(f"[System Error] {error_msg}")

def send_webhook(file_bytes, file_name, endpoint_path, extra_data=None):
    """Hàm bắn webhook động dựa vào endpoint_path"""
    try:
        url = f"{WEBHOOK_BASE_URL}/{endpoint_path}"
        
        mime_type = 'application/octet-stream'
        if file_name.endswith('.png'):
            mime_type = 'image/png'
        elif file_name.endswith('.wav'):
            mime_type = 'audio/wav'
        elif file_name.endswith('.txt'):
            mime_type = 'text/plain'
            
        files = {'file': (file_name, file_bytes, mime_type)}
        data = {
            'timestamp': str(int(time.time()))
        }
        if extra_data:
            data.update(extra_data)
            
        response = requests.post(url, files=files, data=data)
        debug_log(f"[Webhook] Successfully sent to {url} - Status: {response.status_code}")
        try:
            debug_log(f"[Webhook] Server Response: {response.json()}")
        except:
            debug_log(f"[Webhook] Server Response: {response.text}")
    except Exception as e:
        debug_log(f"[Webhook Error] Failed to send data to {url}. Details: {e}")

if __name__ == "__main__":
    # Start a background thread to listen to Backend WebSocket for final AI results
    def result_listener():
        while True:
            try:
                ws_results = websocket.WebSocket()
                ws_results.connect("ws://localhost:3000/")
                print("[SystemListener] Connected to Backend WebSocket for results.")
                while True:
                    msg = ws_results.recv()
                    try:
                        data = json.loads(msg)
                        if "type" in data and "payload" in data:
                            msg_type = data["type"]
                            text = data["payload"].get("text", "")
                    except Exception as e:
                        pass
            except Exception as e:
                time.sleep(3)

    threading.Thread(target=result_listener, daemon=True).start()

    # Cấu hình phím tắt và nhúng callback
    config = {
        'screenshot_hotkey': 'windows+shift+s',  # Phím kích hoạt Snipping Tool của Windows
        'audio_hotkey': 'ctrl+shift+a',
        'text_hotkey': 'ctrl+q',                 # Phím gửi text mới
        'on_screenshot_captured': handle_screenshot,
        'on_audio_captured': handle_audio,
        'on_audio_stream_chunk': handle_audio_stream_chunk,
        'on_audio_stream_end': handle_audio_stream_end,
        'on_text_captured': handle_text,
        'on_error': handle_error
    }
    
    # Khởi tạo và chạy Listener
    try:
        listener = SystemListener(config)
        listener.start(block=True)
    except KeyboardInterrupt:
        print("\n[System] Stopping gracefully...")
