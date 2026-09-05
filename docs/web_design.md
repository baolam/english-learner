# Thiết Kế Giao Diện UI/UX Web App: LingoAnki (Next.js 14)

Dự án **LingoAnki (English Learner)** được thiết kế giao diện theo phong cách tối giản, hiện đại và tập trung vào trải nghiệm người dùng (**Focus-oriented & Productivity UI**). Màn hình ứng dụng được chia thành cấu trúc 3 cột (Three-pane layout) chuẩn mực như các công cụ năng suất chuyên nghiệp (Obsidian, Notion, Mendeley).

---

## 1. Cấu Trúc Bố Cục Tổng Thể (Three-Pane Layout)

Giao diện ứng dụng sử dụng cấu trúc 3 cột linh hoạt:

* **Left Sidebar (Thanh điều hướng & Thư mục):**
  * Danh mục điều hướng chính (`Dashboard`, `Workspace`, `Vocabulary`, `Anki SRS`, `Schedule`, `Settings`).
  * Danh sách môn học dạng cây phân cấp (Subject Tree Hierarchy).
  * Trạng thái kết nối Realtime (Indicator: Backend Online, AI Service Active, System Listener Connected via SSE).
* **Main Content Area (Vùng nội dung trung tâm):**
  * Hiển thị nội dung chính tùy thuộc vào tuyến đường (Dashboard nhiệm vụ, Trình đọc PDF/Markdown, Bảng quản lý từ vựng, Lịch biểu).
* **Right Panel (AI Copilot & Smart Tools):**
  * Khung chat AI tương tác trực tiếp với tài liệu/ảnh chụp đang xem.
  * Bảng gợi ý từ vựng chuyên ngành được AI quét từ trang hiện tại.
  * Khung thu âm Shadowing giọng nói với hiển thị sóng âm (Audio Waveform) và điểm số phát âm.

---

## 2. Chi Tiết Các Màn Hình Chức Năng

### 2.1. Trang Chủ / Dashboard (`app/page.tsx`)
* **Khối "Nhiệm vụ hôm nay" (Today's Todos & Schedule):**
  * Hiển thị Todo List phân cấp cha-con, cho phép tích chọn hoàn thành trực tiếp.
  * Hiển thị các buổi đọc sách/paper lên lịch trong ngày với đồng hồ đếm ngược.
* **Khối "Tiến độ Anki SRS":**
  * Thống kê thẻ mới (New Cards) và thẻ cần review (Review Cards) theo thuật toán SM-2.
  * Nút hành động nhanh: **"Bắt đầu Ôn tập Anki"**.
* **Khối "Đọc tiếp tục" (Continue Reading):**
  * Bookmark các tài liệu đang đọc dở, click vào để mở lại đúng trang và vị trí highlight gần nhất.

### 2.2. Khu Vực Quản Lý Tài Liệu (`app/documents/page.tsx`)
* **Cây thư mục Môn học (Subject Folders):** Cho phép tạo môn học mới, tạo thư mục con (ví dụ: `Machine Learning` > `Papers`).
* **Bảng danh sách Tài liệu (Document Grid/Table View):**
  * Hiển thị Tên tài liệu, Tác giả, Năm xuất bản, Loại file (PDF, EPUB, URL), Tag, Trạng thái (`UNREAD/READING/COMPLETED`) và Tiến độ đọc (`readingProgress`).
* **Thanh công cụ hàng loạt (Bulk Actions):** Chọn nhiều paper để thực hiện hành động: **"Export Markdown sang Obsidian"** hoặc **"Đồng bộ Metadata"**.

### 2.3. Màn Hình Đọc Tài Liệu & AI Copilot (`app/documents/[id]/page.tsx`) - *NỘI DUNG CỐT LÕI*
* **Vùng Trung Tâm (Document Viewer):**
  * Trình đọc PDF / Text trực tiếp.
  * **Floating Context Menu (Menu nổi khi bôi đen text):** Kích hoạt khi người dùng bôi đen đoạn văn bản:
    * `🔍 Tra từ & Lưu vào Term (US13, US14)`
    * `📝 Paraphrase / Tóm tắt AI (US06)`
    * `🧩 Phân tích cú pháp ngữ pháp (US04 - NLTK)`
    * `🎙️ Luyện phát âm / Shadowing (US12)`
* **Vùng Cột Phải (AI Copilot Panel):**
  * **Tab 1: Chat với AI Copilot:** Đặt câu hỏi chuyên sâu về nội dung paper đang đọc. AI giữ ngữ cảnh (Context) của trang hiện tại.
  * **Tab 2: Smart Vocabulary:** AI tự động quét danh sách từ vựng/thuật ngữ gợi ý. Hiển thị giải nghĩa Anh-Anh, ví dụ và câu gốc (Context Sentence). Nút **"Lưu & Sync sang Anki"**.
  * **Tab 3: Luyện nói (Shadowing):** Hiển thị đoạn văn bản cần đọc, sóng âm microphone và điểm số độ chính xác phát âm thu được từ Whisper API.

### 2.4. Màn Hình Quản Lý Từ Vựng & Anki SRS (`app/terms/page.tsx` & `app/anki/page.tsx`)
* **Quản lý thuật ngữ (Term Manager):** Hiển thị toàn bộ từ vựng đã lưu kèm câu ngữ cảnh gốc và lời giải thích AI.
* **Cảnh báo chống trùng lặp thẻ Anki:** Hiển thị cảnh báo nếu từ vựng chuẩn bị lưu đã tồn tại trong Deck Anki tương ứng.
* **Sync Manager:** Xem trước (Preview) mặt trước và mặt sau thẻ Anki trước khi đẩy dữ liệu sang Anki Desktop qua AnkiConnect REST.

### 2.5. Trang Cấu Hình Hệ Thống (`app/settings/page.tsx`)
* Cấu hình phím tắt toàn hệ thống (`Windows + Shift + S`, `Ctrl + Shift + A`, `Ctrl + Q`).
* Cấu hình tham số ngắt giọng nói Silero VAD (Threshold, Silence Duration, GPU acceleration).
* Cấu hình AnkiConnect URL (`http://127.0.0.1:8765`) và Tên Deck mặc định.
* Cấu hình đường dẫn thư mục Obsidian Vault (`obsidianVaultPath`).
* Khi lưu settings, trang Web tự động gửi thông báo SSE `SETTINGS_UPDATED` để System Listener áp dụng ngay lập tức mà không cần khởi động lại.

---

## 3. Công Nghệ Frontend Sử Dụng

* **Framework:** Next.js 14 App Router (`@english-learner/web`).
* **Styling:** Tailwind CSS v3 + Typography plugin.
* **State Management:** Zustand Store (Lưu trữ trạng thái tài liệu đang đọc, kết nối realtime WebSocket/SSE, settings cache).
* **Icons:** Lucide React icons.
* **Markdown Renderer:** `react-markdown` hỗ trợ định dạng phản hồi AI Copilot và ghi chú Obsidian.
