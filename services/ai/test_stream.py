import requests
import json
import sys

def test_streaming(url, payload, headers=None):
    if headers is None:
        headers = {"Content-Type": "application/json"}
    
    print(f"Đang kết nối tới {url}...")
    try:
        # Gửi request với tham số stream=True
        with requests.post(url, json=payload, headers=headers, stream=True) as response:
            response.raise_for_status()
            print("Bắt đầu nhận stream:\n" + "-"*40)
            
            # Đọc từng dòng trả về
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    
                    # Các API stream thường bắt đầu bằng "data: "
                    if decoded_line.startswith("data: "):
                        data_str = decoded_line[6:]
                        
                        # Tín hiệu kết thúc stream phổ biến
                        if data_str.strip() == "[DONE]":
                            break
                            
                        try:
                            data = json.loads(data_str)
                            # Trích xuất nội dung (cấu trúc này chuẩn theo OpenAI)
                            if 'choices' in data and len(data['choices']) > 0:
                                chunk = data['choices'][0].get('delta', {}).get('content', '')
                                if chunk:
                                    sys.stdout.write(chunk)
                                    sys.stdout.flush()
                        except json.JSONDecodeError:
                            # Bỏ qua nếu dòng không phải JSON hợp lệ
                            pass
                            
        print("\n" + "-"*40 + "\nHoàn tất stream.")
        
    except requests.exceptions.RequestException as e:
        print(f"\nLỗi kết nối: {e}")

if __name__ == "__main__":
    # --- CẤU HÌNH API Ở ĐÂY ---
    # Thay đổi URL này thành endpoint API AI của bạn (VD: Ollama, LM Studio, vLLM, OpenAI...)
    API_URL = "http://localhost:11434/v1/chat/completions" # URL ví dụ cho Ollama
    
    # Payload cần đảm bảo có cờ "stream": True
    PAYLOAD = {
        "model": "llama3.1", # Thay tên model bạn đang chạy
        "messages": [
            {"role": "user", "content": "Viết một bài thơ ngắn 4 câu về lập trình."}
        ],
        "stream": True
    }
    
    # Nếu gọi API thật (như OpenAI/Gemini), bạn cần thêm headers có Bearer Token
    # HEADERS = {
    #     "Content-Type": "application/json",
    #     "Authorization": "Bearer YOUR_API_KEY"
    # }
    
    test_streaming(API_URL, PAYLOAD) # Truyền thêm tham số headers=HEADERS nếu cần
