import requests
import time
import os
import json
import threading
import websocket
from listener import SystemListener

WEBHOOK_BASE_URL = "http://localhost:3000/input"
WS_WHISPER_URL = "ws://localhost:8000/api/whisper/stream"

# Đường dẫn thư mục temp nằm cùng cấp với file main.py
TEMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp")

# Tự động tạo thư mục temp nếu chưa có
os.makedirs(TEMP_DIR, exist_ok=True)

# Khởi tạo WebSocket toàn cục cho streaming audio
ws_client = None

def get_or_create_ws():
    global ws_client
    if ws_client is None or not ws_client.connected:
        try:
            ws_client = websocket.WebSocket()
            ws_client.connect(WS_WHISPER_URL)
            # Thông báo cho server biết dạng data là PCM
            ws_client.send(json.dumps({"format": "pcm", "channels": 2, "samplerate": 44100}))
            print("[WebSocket] Đã kết nối tới Whisper Stream (PCM)")
        except Exception as e:
            print(f"[WebSocket Lỗi] Không thể kết nối: {e}")
            ws_client = None
    return ws_client

def handle_screenshot(image_bytes):
    """Callback xử lý khi có ảnh mới từ Snipping Tool"""
    file_name = "screenshot.png"
    file_path = os.path.join(TEMP_DIR, file_name)
    
    # Ghi đè file cũ (luôn luôn là screenshot.png)
    with open(file_path, "wb") as f:
        f.write(image_bytes)
        
    print(f"[Callback] Đã lưu ảnh tạm (ghi đè) tại: {file_path}")
    print(f"[Callback] Kích thước: {len(image_bytes)} bytes. Đang gửi Webhook...")
    
    send_webhook(image_bytes, file_name, "screen")

def handle_audio(audio_bytes, text_result=""):
    """Callback xử lý khi có file audio hoàn chỉnh để gửi lên Management Server"""
    file_name = "audio.wav"
    file_path = os.path.join(TEMP_DIR, file_name)
    
    # Ghi đè file cũ
    with open(file_path, "wb") as f:
        f.write(audio_bytes)
        
    print(f"[Callback] Đã lưu file audio tổng tại: {file_path}")
    print(f"[Callback] Kích thước: {len(audio_bytes)} bytes. Đang gửi Webhook (Management)...")
    
    extra_data = {'text': text_result} if text_result else {}
    send_webhook(audio_bytes, file_name, "sound", extra_data=extra_data)

def handle_audio_stream_chunk(audio_bytes):
    """Callback xử lý khi có chunk audio mới (Streaming)"""
    ws = get_or_create_ws()
    if ws:
        try:
            # Gửi chunk nhị phân PCM lên server
            ws.send_binary(audio_bytes)
        except Exception as e:
            print(f"[WebSocket Lỗi] Gửi chunk thất bại: {e}")

def handle_audio_stream_end():
    """Callback xử lý khi kết thúc thu âm, trả về text dịch được"""
    global ws_client
    ws = get_or_create_ws()
    text_result = ""
    if ws:
        try:
            # Gửi lệnh TRANSCRIBE
            print("[WebSocket] Đã gửi lệnh TRANSCRIBE, đang chờ kết quả...")
            ws.send(json.dumps({"text": "TRANSCRIBE"}))
            
            # Chờ nhận kết quả từ Server
            response = ws.recv()
            print(f"[AI Service Phản hồi] {response}")
            
            try:
                data = json.loads(response)
                if "text" in data:
                    text_result = data["text"]
            except:
                pass
                
        except Exception as e:
            print(f"[WebSocket Lỗi] {e}")
        finally:
            ws.close()
            ws_client = None
    return text_result

def handle_text(text: str):
    """Callback xử lý khi có text mới gửi (Ctrl+E)"""
    file_name = "text.txt"
    file_path = os.path.join(TEMP_DIR, file_name)
    
    # Ghi đè file cũ (luôn luôn là text.txt)
    text_bytes = text.encode('utf-8')
    with open(file_path, "wb") as f:
        f.write(text_bytes)
        
    print(f"[Callback] Đã lưu text tạm (ghi đè) tại: {file_path}")
    print(f"[Callback] Kích thước: {len(text_bytes)} bytes. Đang gửi Webhook...")
    
    # Bắn Webhook lên /input/text
    send_webhook(text_bytes, file_name, "text")

def handle_error(error_msg):
    """Callback xử lý lỗi"""
    print(f"[Lỗi Hệ Thống] {error_msg}")

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
        print(f"[Webhook] Bắn thành công lên {url} - Status: {response.status_code}")
    except Exception as e:
        print(f"[Webhook Lỗi] Không thể gửi dữ liệu lên {url}. Chi tiết: {e}")

if __name__ == "__main__":
    # Cấu hình phím tắt và nhúng callback
    config = {
        'screenshot_hotkey': 'windows+shift+s',  # Phím kích hoạt Snipping Tool của Windows
        'audio_hotkey': 'ctrl+shift+a',
        'text_hotkey': 'ctrl+e',                 # Phím gửi text mới
        'on_screenshot_captured': handle_screenshot,
        'on_audio_captured': handle_audio,
        'on_audio_stream_chunk': handle_audio_stream_chunk,
        'on_audio_stream_end': handle_audio_stream_end,
        'on_text_captured': handle_text,
        'on_error': handle_error
    }
    
    # Khởi tạo và chạy Listener
    listener = SystemListener(config)
    listener.start(block=True)
