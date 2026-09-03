# Hướng dẫn Phát triển Dự án (Development Guide)

Dự án này đã được cấu trúc lại dưới dạng Monorepo sử dụng **npm workspaces** và **Turborepo** để quản lý đồng thời cả ứng dụng JS/TS và các dịch vụ Python AI.

## Cấu trúc thư mục

- `backend/`: API Backend viết bằng Node.js / TypeScript.
- `services/ai/`: Service AI xử lý nhận diện giọng nói (Whisper GPU) và LLM (Llama CPU) viết bằng Python.
- `services/system-listener/`: Service lắng nghe phím tắt hệ thống, copy text và chụp màn hình viết bằng Python.
- `shared/types/`: Nơi chứa các định nghĩa TypeScript (`.ts`) dùng chung cho toàn bộ dự án.
- `.venv/`: Môi trường ảo Python dùng chung cho tất cả các dịch vụ Python. (Không commit lên Git).

## Cài đặt lần đầu

1. **Cài đặt thư viện Node.js:**
   ```bash
   npm install
   ```

2. **Cài đặt môi trường Python (Dành cho AI Services):**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   
   # Cài đặt PyTorch hỗ trợ GPU (CUDA 11.8 cho MX130)
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
   
   # Cài đặt Whisper và các thư viện khác
   pip install openai-whisper
   pip install -r requirements.txt
   
   # Cài đặt Llama (Bản CPU để tiết kiệm VRAM)
   pip install llama-cpp-python
   ```

## Chạy dự án (Development)

Chỉ cần đứng ở thư mục gốc (root) và chạy lệnh sau:

```bash
npm run dev
```

**Turborepo** sẽ tự động khởi động đồng thời:
1. Backend (`nodemon`)
2. AI Service (`python main.py` chạy qua `.venv`)
3. System Listener (`python main.py` chạy qua `.venv`)

Tất cả log sẽ được stream chung vào một cửa sổ Terminal với các màu sắc khác nhau để bạn dễ dàng theo dõi.

## Quản lý Thư viện

- **Node.js:** Khi cần cài thêm thư viện cho backend, sử dụng cú pháp workspace: `npm install <package> -w backend`
- **Python:** Bật môi trường `.venv`, cài đặt qua `pip` và nhớ update lại file `requirements.txt`:
  ```bash
  .venv\Scripts\activate
  cd services/ai
  pip install <tên_thư_viện>
  pip freeze > requirements.txt
  ```
