# LingoAnki 📚 (English Learner)

**LingoAnki** là một hệ thống Trợ lý Học tập & Nghiên cứu Tiếng Anh Toàn diện (**AI Learning & Research Assistant**). Hệ thống được thiết kế theo mô hình Monorepo đa dịch vụ, hỗ trợ người dùng trong việc đọc tài liệu học thuật (PDF, Sách, Paper), phân tích cấu trúc ngữ pháp phức tạp, tra từ vựng chuyên ngành theo ngữ cảnh, luyện phát âm/shadowing với AI, chụp màn hình OCR nhanh bằng phím tắt hệ thống và tự động đồng bộ thẻ ghi nhớ với phần mềm **Anki** (Spaced Repetition System).

---

## 🏗️ Cấu Trúc Dự Án (Monorepo Architecture)

Dự án được quản lý theo dạng Monorepo bằng **npm workspaces** và **Turborepo**:

```text
english-learner/
├── backend/                  # API Server chính (Node.js, Express, TypeScript, Prisma, SQLite, SSE, WebSockets)
├── services/
│   ├── ai/                   # AI Microservice (Python FastAPI, Whisper STT, OCR Worker qua Redis, NLTK, Llama)
│   └── system-listener/      # Background Listener lắng nghe phím tắt toàn hệ thống (Python, Silero VAD ONNX Runtime)
├── frontend/
│   ├── web/                  # Giao diện Web App chính (Next.js 14 App Router, React 18, Tailwind CSS, Zustand)
│   ├── desktop/              # Ứng dụng Native Desktop (C# WPF .NET)
│   └── mobile/               # Ứng dụng Mobile (Đang phát triển)
├── shared/
│   └── types/                # Định nghĩa TypeScript Types dùng chung giữa Frontend & Backend
├── docs/                     # Tài liệu thiết kế hệ thống, kiến trúc & User Stories
├── DEVELOPMENT.md            # Hướng dẫn chi tiết thiết lập môi trường lập trình
├── turbo.json                # Cấu hình Turborepo build & dev pipeline
└── package.json              # Monorepo root configuration & scripts
```

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

### 1. Management Backend (`backend/`)
* **Core:** Node.js, Express, TypeScript.
* **Database & ORM:** SQLite, Prisma ORM.
* **Realtime Broadcast & Streaming:** WebSockets (`ws`), Server-Sent Events (SSE).
* **Caching & Queue:** Redis (`ioredis`).
* **Lịch trình & Nhắc nhở:** `node-cron`.
* **Validation & Utilities:** `zod`, `multer`, `axios`.

### 2. AI Microservice (`services/ai/`)
* **Framework:** Python, FastAPI, Uvicorn.
* **Background Worker:** Redis OCR Worker (`ocr_tasks`).
* **Speech-to-Text (STT):** OpenAI Whisper (Nhận diện giọng nói từ âm thanh hệ thống).
* **Phân tích Ngữ pháp:** NLTK (Natural Language Toolkit).
* **LLM & Structured Output:** Llama (local) / Google Gemini API.

### 3. System Listener Service (`services/system-listener/`)
* **Core:** Python, `pynput` (Bắt phím tắt hệ thống toàn cục).
* **Voice Activity Detection (VAD):** Silero VAD (ONNX Runtime) nhận diện khoảng lặng thông minh để tự động ngắt ghi âm.
* **Giao tiếp:** Webhooks (đẩy dữ liệu về Backend) và SSE Client (nhận cấu hình thời gian thực từ Backend).

### 4. Frontend Web App (`frontend/web/`)
* **Framework:** Next.js 14 (App Router), React 18, TypeScript.
* **Styling:** Tailwind CSS v3, Typography plugin.
* **State Management:** Zustand.
* **Icons & Components:** Lucide React, Date-fns, React Big Calendar, Hello Pangea DnD.
* **Markdown & Reader:** `react-markdown`.

### 5. Frontend Desktop App (`frontend/desktop/`)
* **Framework:** C# WPF (.NET Framework / .NET Core).

---

## 🎹 Phím Tắt Hệ Thống Mặc Định (Global Hotkeys)

Service `system-listener` luôn chạy ẩn trên máy tính để hỗ trợ các thao tác nhanh:

* **`Windows + Shift + S`**: Chụp màn hình góc đọc -> tự động gửi về Backend chạy OCR trích xuất chữ và tra từ vựng/khái niệm.
* **`Ctrl + Shift + A`**: Ghi âm giọng nói (Shadowing/Luyện nói) -> Tự động dừng khi ngừng nói (Silero VAD) -> gửi file audio và kết quả nhận diện giọng nói về Backend.
* **`Ctrl + Q`**: Copy đoạn văn bản tiếng Anh bất kỳ -> tự động gửi về Backend để tra cứu hoặc phân tích ngữ pháp.

---

## 🛠️ Hướng Dẫn Cài Đặt & Khởi Chạy (Quick Start)

### Yêu Cầu Tiên Quyết
1. **Node.js**: v18.x trở lên.
2. **Python**: v3.10 trở lên.
3. **Docker**: (Dùng để khởi chạy Redis container).
4. **Anki Desktop**: Tùy chọn (Nếu muốn đồng bộ thẻ lặp lại ngắt quãng qua add-on **AnkiConnect** - mặc định chạy ở port `8765`).

---

### Các Bước Thực Hiện

#### 1. Clone repository
```bash
git clone <repository-url>
cd english-learner
```

#### 2. Cài đặt Node dependencies (Monorepo Root)
```bash
npm install
```

#### 3. Tạo môi trường ảo Python & cài đặt dependencies
```bash
python -m venv .venv

# Trên Windows Powershell:
.\.venv\Scripts\activate

# Cài đặt thư viện Python cho AI Service & System Listener:
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install -r services/ai/requirements.txt
pip install -r services/system-listener/requirements.txt
```

#### 4. Cấu hình biến môi trường (.env)
Tạo file `.env` trong thư mục `backend/` (xem ví dụ trong `backend/.env` mẫu):
```env
PORT=3000
DATABASE_URL="file:./dev.db"
REDIS_URL="redis://localhost:6379"
AI_SERVICE_URL="http://localhost:8000"
GEMINI_API_KEY="your-gemini-api-key"
```

#### 5. Khởi chạy toàn bộ hệ thống (Dev Mode)
Chạy một lệnh duy nhất tại thư mục gốc:
```bash
npm run dev
```

**Turborepo** và **Concurrently** sẽ tự động kích hoạt đồng thời 5 dịch vụ:
1. **Backend API**: `http://localhost:3000`
2. **Web Frontend**: `http://localhost:3001`
3. **AI Service (FastAPI)**: `http://localhost:8000`
4. **System Listener**: (Background Python Process với Silero VAD)
5. **Redis Container**: `localhost:6379` (Docker)

---

## 📖 Tài Liệu Tham Khảo Thêm

* [Hướng dẫn Phát triển (DEVELOPMENT.md)](DEVELOPMENT.md)
* [Kiến trúc Hệ thống Chi tiết (docs/system_architecture.md)](docs/system_architecture.md)
* [User Stories (docs/user_stories.md)](docs/user_stories.md)
* [Thiết kế Giao diện Web (docs/web_design.md)](docs/web_design.md)

---

## 📝 Giấy Phép (License)

Dự án được phân phối dưới giấy phép **MIT License**.
