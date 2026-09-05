import sys
import io

# Cấu hình encoding UTF-8 cho sys.stdout/sys.stderr để tránh UnicodeEncodeError trên Windows console
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
if hasattr(sys.stderr, 'reconfigure'):
    try:
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import requests
import time
import os
import json
import threading
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
DEBUG_MODE = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")

def debug_log(msg):
    msg_str = str(msg)
    with open(os.path.join(TEMP_DIR, "debug.log"), "a", encoding="utf-8") as f:
        f.write(msg_str + "\n")
    try:
        print(msg_str)
    except UnicodeEncodeError:
        print(msg_str.encode('utf-8', errors='ignore').decode('ascii', errors='ignore'))

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
    
    # Ghi đè file cũ (audio.wav)
    with open(file_path, "wb") as f:
        f.write(audio_bytes)
        
    debug_log(f"[Callback] Saved final audio file at: {file_path}")
    debug_log(f"[Callback] Size: {len(audio_bytes)} bytes. Sending Webhook (Management)...")
    
    # Chế độ Debug: Ghi thêm file audio temp kèm timestamp để kiểm tra/đối chiếu
    if DEBUG_MODE:
        timestamp_str = time.strftime("%Y%m%d_%H%M%S")
        debug_audio_name = f"audio_{timestamp_str}.wav"
        debug_audio_path = os.path.join(TEMP_DIR, debug_audio_name)
        with open(debug_audio_path, "wb") as f:
            f.write(audio_bytes)
        debug_log(f"[Debug Audio] Saved timestamped audio temp file at: {debug_audio_path} ({len(audio_bytes)} bytes)")
    
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

def map_backend_settings(data: dict) -> dict:
    """Ánh xạ dữ liệu cấu hình từ Backend API sang định dạng config của SystemListener"""
    config = {}
    if "screenshotHotkey" in data and data["screenshotHotkey"]:
        config["screenshot_hotkey"] = data["screenshotHotkey"]
    if "audioHotkey" in data and data["audioHotkey"]:
        config["audio_hotkey"] = data["audioHotkey"]
    if "textHotkey" in data and data["textHotkey"]:
        config["text_hotkey"] = data["textHotkey"]
    if "vadEnabled" in data:
        config["vad_enabled"] = data["vadEnabled"]
    if "vadThreshold" in data:
        config["vad_threshold"] = data["vadThreshold"]
    if "vadSilenceDuration" in data:
        config["vad_silence_duration"] = data["vadSilenceDuration"]
    if "vadUseGpu" in data:
        config["vad_use_gpu"] = data["vadUseGpu"]
    return config

def fetch_backend_settings() -> dict:
    """Lấy cấu hình ban đầu từ Backend API (/api/settings) khi khởi động"""
    try:
        url = f"{WEBHOOK_BASE_URL}/api/settings"
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            debug_log("[Settings] Successfully fetched initial settings from Backend API.")
            return map_backend_settings(response.json())
    except Exception as e:
        debug_log(f"[Settings Warning] Could not fetch settings from Backend ({e}). Using local default config.")
    return {}

def sse_listener(listener_instance: SystemListener):
    """
    Thread nền kết nối SSE (/api/stream). Khi Backend phát sự kiện SETTINGS_UPDATED,
    hàm sẽ cập nhật cấu hình mới trực tiếp xuống listener_instance ở thời điểm runtime.
    """
    stream_url = f"{WEBHOOK_BASE_URL}/api/stream"
    while True:
        try:
            debug_log(f"[SSE] Connecting to Backend stream at {stream_url}...")
            response = requests.get(stream_url, stream=True, timeout=(5, None))
            debug_log("[SSE] Connected to Backend stream for real-time updates.")
            
            for line in response.iter_lines():
                if line:
                    line_str = line.decode('utf-8')
                    if line_str.startswith("data:"):
                        data_json = line_str[5:].strip()
                        try:
                            event = json.loads(data_json)
                            if event.get("type") == "SETTINGS_UPDATED":
                                payload = event.get("payload", {})
                                debug_log(f"[SSE] Received SETTINGS_UPDATED event: {payload}")
                                new_config = map_backend_settings(payload)
                                listener_instance.update_config(new_config)
                        except Exception as parse_err:
                            pass
        except Exception as e:
            debug_log(f"[SSE Error] Disconnected from stream: {e}. Retrying in 5 seconds...")
            time.sleep(5)

if __name__ == "__main__":
    # Cấu hình phím tắt mặc định và nhúng callback
    config = {
        'screenshot_hotkey': 'windows+shift+s',  # Phím kích hoạt Snipping Tool của Windows
        'audio_hotkey': 'ctrl+shift+a',
        'text_hotkey': 'ctrl+q',                 # Phím gửi text mới
        'on_screenshot_captured': handle_screenshot,
        'on_audio_captured': handle_audio,
        'on_audio_stream_chunk': handle_audio_stream_chunk,
        'on_audio_stream_end': handle_audio_stream_end,
        'on_audio_transcribe_chunk': handle_audio_transcribe_chunk,
        'on_text_captured': handle_text,
        'on_error': handle_error,
        # Smart Auto-Stop VAD Config
        'vad_enabled': True,
        'vad_threshold': 0.2,
        'vad_silence_duration': 5.0,
        'vad_use_gpu': True
    }
    
    # Lấy cài đặt từ Backend API nếu có sẵn
    backend_config = fetch_backend_settings()
    config.update(backend_config)
    
    # Khởi tạo Listener
    try:
        listener = SystemListener(config)
        
        # Chạy thread lắng nghe SSE để nhận cấu hình chủ động từ Backend khi người dùng thay đổi trên Frontend
        threading.Thread(target=sse_listener, args=(listener,), daemon=True).start()
        
        # Bắt đầu chạy Listener
        listener.start(block=True)
    except KeyboardInterrupt:
        print("\n[System] Stopping gracefully...")
