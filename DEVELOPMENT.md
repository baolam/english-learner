# Hướng Dẫn Phát Triển Dự Án (Development Guide)

Dự án **LingoAnki (English Learner)** được cấu trúc dưới dạng Monorepo sử dụng **npm workspaces** và **Turborepo** để quản lý đồng thời cả ứng dụng Web Next.js, Desktop WPF, Backend Express API và các dịch vụ Python AI/System Listener.

---

## 1. Cấu Trúc Thư Mục Monorepo

* **`backend/`**: Express API server viết bằng TypeScript. Quản lý SQLite CSDL qua Prisma ORM, SSE, WebSockets, Redis Publisher.
* **`services/ai/`**: Service AI Microservice viết bằng Python FastAPI (Whisper STT, OCR Worker qua Redis, NLTK, Llama/Gemini). Package: `@english-learner/ai-service`.
* **`services/system-listener/`**: Service Python lắng nghe phím tắt toàn hệ thống (`pynput`), thu âm VAD thông minh (`silero-vad`), gửi Webhook và nhận SSE cấu hình. Package: `@english-learner/system-listener`.
* **`frontend/web/`**: Giao diện Web App viết bằng Next.js 14 (App Router), React 18, Tailwind CSS, Zustand. Package: `@english-learner/web`.
* **`frontend/desktop/`**: Ứng dụng Desktop Native viết bằng C# WPF (.NET).
* **`shared/types/`**: Định nghĩa TypeScript Types dùng chung giữa Frontend & Backend. Package: `@english-learner/shared-types`.
* **`.venv/`**: Môi trường ảo Python dùng chung cho tất cả các dịch vụ Python (Không commit lên Git).

---

## 2. Yêu Cầu Môi Trường (Prerequisites)

* **Node.js**: `v18.0.0` trở lên.
* **Python**: `v3.10.0` trở lên.
* **Docker Desktop**: Cần thiết để khởi chạy container Redis (`redis:latest`).
* **Anki Desktop**: Khuyến nghị cài đặt thêm add-on **AnkiConnect** (Mã add-on: `2055492159`) để thử nghiệm đồng bộ thẻ ghi nhớ SRS.

---

## 3. Cài Đặt Lần Đầu (First-time Setup)

### Bước 1: Cài đặt Node.js Workspaces Dependencies
Tại thư mục gốc (root) của dự án:
```bash
npm install
```

### Bước 2: Tạo Môi Trường Ảo Python & Cài Đặt Thư Viện
Tạo môi trường ảo `.venv` dùng chung tại thư mục gốc:

```bash
# Tạo virtualenv
python -m venv .venv

# Kích hoạt venv trên Windows Powershell:
.\.venv\Scripts\activate

# Nâng cấp pip
python -m pip install --upgrade pip

# Cài đặt PyTorch (Bản hỗ trợ GPU CUDA 11.8 hoặc CPU tùy cấu hình máy)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Cài đặt các phụ thuộc cho AI Service & System Listener
pip install -r services/ai/requirements.txt
pip install -r services/system-listener/requirements.txt

# Tải trước các gói dữ liệu NLTK và spaCy (cho xử lý ngữ pháp)
python -m nltk.downloader universal_tagset punkt averaged_perceptron_tagger
```

### Bước 3: Cấu Hình Biến Môi Trường (.env)
1. **Backend (`backend/.env`):**
   ```env
   PORT=3000
   DATABASE_URL="file:./dev.db"
   REDIS_URL="redis://localhost:6379"
   AI_SERVICE_URL="http://localhost:8000"
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```

2. **AI Service (`services/ai/.env`):**
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   BACKEND_API_URL=http://localhost:3000
   ```

3. **System Listener (`services/system-listener/.env`):**
   ```env
   WEBHOOK_BASE_URL=http://127.0.0.1:3000
   AI_WHISPER_URL=http://localhost:8000/api/whisper
   DEBUG=true
   ```

### Bước 4: Khởi Tạo Cơ Sở Dữ Liệu SQLite (Prisma)
Chạy lệnh push schema để tạo các bảng dữ liệu SQLite trong `backend/prisma/dev.db`:

```bash
cd backend
npx prisma db push
npx prisma generate
cd ..
```

---

## 4. Khởi Chạy Dự Án (Development Pipeline)

Chỉ cần đứng tại thư mục gốc và chạy lệnh duy nhất:

```bash
npm run dev
```

**Turborepo** kết hợp với **Concurrently** sẽ tự động khởi chạy 5 tiến trình đồng thời:
1. `backend`: Backend API Nodemon server (`http://localhost:3000`)
2. `listener`: System Listener lắng nghe phím tắt & Silero VAD
3. `ai`: AI Microservice FastAPI (`http://localhost:8000`)
4. `redis`: Container Docker Redis (`localhost:6379`)
5. `web`: Next.js Web Frontend dev server (`http://localhost:3001`)

Log của cả 5 dịch vụ sẽ được stream chung vào một cửa sổ Terminal duy nhất với các nhãn màu phân biệt.

---

## 5. Quản Lý Thư Viện (Dependencies Management)

### Cài Đặt Thư Viện Node.js
Sử dụng cú pháp workspace để cài đặt chính xác vào sub-project:

```bash
# Cài đặt cho Backend:
npm install <package-name> -w backend

# Cài đặt cho Web Frontend:
npm install <package-name> -w @english-learner/web

# Cài đặt devDependency ở root:
npm install <package-name> -D
```

### Cài Đặt Thư Viện Python
Kích hoạt môi trường `.venv` trước khi cài đặt:

```bash
.\.venv\Scripts\activate

# Cài đặt gói mới cho AI Service:
pip install <package-name>
pip freeze > services/ai/requirements.txt

# Cài đặt gói mới cho System Listener:
pip install <package-name>
pip freeze > services/system-listener/requirements.txt
```

---

## 6. Xử Lý Lỗi Thường Gặp (Troubleshooting)

### 1. Lỗi Hiển Thị Unicode / Ký Tự Tiếng Việt Trong Console Windows
Nếu gặp lỗi `UnicodeEncodeError` khi Python in log ra terminal Windows:
* File `services/system-listener/main.py` và `services/ai/main.py` đã được cấu hình tự động reconfigure `sys.stdout` sang `utf-8`.
* Hãy đảm bảo môi trường Powershell của bạn chạy lệnh `$OutputEncoding = [System.Text.Encoding]::UTF8`.

### 2. Lỗi Không Kết Nối Được Đến Redis
* Đảm bảo **Docker Desktop** đã khởi động.
* Bạn có thể test thủ công lệnh: `docker run --rm -p 6379:6379 redis`.

### 3. Lỗi Kết Nối AnkiConnect (`http://127.0.0.1:8765`)
* Đảm bảo ứng dụng **Anki Desktop** đang mở trên máy.
* Trong Anki Desktop -> Tools -> Add-ons -> Chọn AnkiConnect -> Config -> Thêm `"http://localhost:3000"` và `"http://localhost:3001"` vào danh sách `webCorsOriginList`.

### 4. Silero VAD hoặc Whisper Bị Lỗi GPU CUDA
* Nếu máy tính không có GPU NVIDIA hỗ trợ CUDA, chuyển tham số `vad_use_gpu: false` trong cài đặt hoặc cài đặt bản PyTorch CPU (`pip install torch torchvision torchaudio`).
