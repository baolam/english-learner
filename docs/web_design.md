# Thiết Kế UI/UX Web App: English Learner (Learning Assistant)

Dựa trên các User Story đã cung cấp, dự án không chỉ đơn thuần là một app học ngoại ngữ mà là một **Trợ lý học tập và nghiên cứu toàn diện (Learning Assistant)**. Để hiện thực hóa điều này trên nền tảng Web, giao diện cần được thiết kế tối ưu cho việc **đọc tài liệu (Reading)**, **quản lý tri thức (Knowledge Management)**, và **tương tác với AI (AI Copilot)**.

Dưới đây là bản thiết kế cấu trúc và giao diện cho phiên bản Web.

---

## 1. Cấu trúc Tổng thể (Global Layout)

Giao diện Web nên sử dụng cấu trúc **3 cột chính (Three-pane layout)**, một layout rất phổ biến và hiệu quả trong các ứng dụng năng suất (như Obsidian, Notion, hay Mendeley).

*   **Left Sidebar (Thanh điều hướng bên trái):** Dùng để quản lý không gian học tập, thư mục môn học, và công cụ cá nhân.
*   **Main Content Area (Khu vực nội dung chính):** Không gian rộng nhất để hiển thị file PDF, bài báo, dashboard, hoặc danh sách từ vựng.
*   **Right Panel (AI Copilot & Tools):** Cửa sổ trợ lý AI luôn thường trực bên phải để tương tác với nội dung đang hiển thị ở giữa.

---

## 2. Chi tiết Các Màn Hình và Tính Năng (Theo User Stories)

### 2.1. Trang Chủ / Bảng Điều Khiển (Dashboard)
*Phục vụ các US: 16, 18, 20, 09*

*   **Khối "Hôm nay cần làm gì?" (Today's Tasks):**
    *   Hiển thị **Todo List** (Ví dụ: "Đọc xong Chương 2 sách AI", "Review 50 thẻ Anki môn Toán"). User có thể check để đánh dấu hoàn thành.
    *   Hiển thị **Lịch trình (Schedules)** các buổi học/đọc paper sắp tới.
*   **Khối "Tiến độ Anki" (Spaced Repetition Stats):**
    *   Thống kê trực quan số lượng thẻ "New Cards" và "Review Cards" trong ngày (kết nối API với Anki).
    *   Nút CTA: **"Bắt đầu ôn tập ngay"**.
*   **Khối "Đọc tiếp tục" (Continue Reading):**
    *   Lưu trữ bookmark. Hiển thị sách/paper đang đọc dở và click vào để mở lại đúng trang đang đọc.

### 2.2. Khu vực Quản lý Tài liệu (Workspace / Library)
*Phục vụ các US: 05, 08, 10, 11*

*   **Tree-view Tổ chức thư mục (Subject Folders):** Nằm ở Sidebar trái, cho phép tạo các folder lồng nhau (Ví dụ: `Machine Learning` > `Papers` / `Books`).
*   **Danh sách Tài liệu (Document List):**
    *   Hiển thị ở vùng Main Content dưới dạng bảng (Table view) hoặc thẻ (Grid view).
    *   Thông tin hiển thị: Tên tài liệu, Tác giả, Tags, Local Path/URL, Tiến độ đọc (%), Trạng thái đồng bộ.
*   **Thanh công cụ hàng loạt (Bulk Actions):** Chọn nhiều paper để thực hiện hành động: "Export sang Obsidian (Markdown)" hoặc "Gửi metadata tới NotebookLM".

### 2.3. Màn hình Đọc Tài liệu & Tương tác AI (Reader View) - *CỐT LÕI*
*Đây là màn hình quan trọng nhất của ứng dụng, nơi diễn ra các US: 02, 03, 04, 06, 07, 12, 13, 14.*

**A. Vùng nội dung (Center Pane - PDF/Text Viewer):**
*   Trình xem tài liệu trực tiếp (tích hợp PDF.js hoặc trình đọc Markdown/HTML).
*   **Floating Context Menu (Menu nổi):** Khi người dùng **bôi đen (highlight)** một cụm từ, câu, hoặc đoạn văn khó, một menu nhỏ hiện ra cung cấp các lối tắt:
    *   `🔍 Tra từ & Lưu từ (US13, US14)`
    *   `📝 Paraphrase / Tóm tắt (US06)`
    *   `🧩 Phân tích ngữ pháp câu (US04)`
    *   `🎙️ Phát âm & Luyện nói (US12)`

**B. Vùng AI Copilot (Right Pane):**
*   **Tab 1: Chat với AI (Contextual Chat):** Khung chat tương tự ChatGPT nhưng có khả năng hiểu ngữ cảnh của tài liệu đang mở. Người dùng có thể chat và hỏi đáp sâu hơn về chuyên môn.
*   **Tab 2: Smart Vocabulary:**
    *   AI tự động quét trang hiện tại và xuất danh sách "Từ vựng/Thuật ngữ nên học" để tiết kiệm thời gian lọc từ.
    *   Khi tra một từ, khung này hiển thị: Giải nghĩa Anh-Anh, Ví dụ, và **Context Sentence** (câu chứa từ đó được trích xuất thẳng từ bài đọc).
    *   Nút: **"Lưu vào danh sách thuật ngữ"** & **"Đồng bộ sang Anki"**.
*   **Tab 3: Luyện nói (Speaking/Shadowing):** Hiển thị UI thu âm (có hình ảnh sóng âm - waveform) để người dùng đọc to câu tiếng Anh và AI (Whisper) nhận diện, chấm điểm.

### 2.4. Công cụ Nhập liệu Đa phương tiện (Media Input)
*Phục vụ US: 01*

*   Nút nổi (Floating Action Button) hoặc phím tắt (Hotkey) ở Sidebar để gọi **"Quét ảnh / Nhập văn bản nhanh"**.
*   Một cửa sổ Modal/Dialog hiện lên cho phép người dùng Paste (Ctrl+V) ảnh chụp màn hình hoặc Upload ảnh. Hệ thống chạy OCR, lấy chữ và đẩy vào khung Chat AI bên phải để tra cứu ngay lập tức.

### 2.5. Quản lý Từ vựng & Tích hợp Anki (Vocabulary & SRS)
*Phục vụ US: 07, 15, 17*

*   Trang chuyên biệt (mở ở Center Pane) quản lý toàn bộ thuật ngữ chuyên ngành đã trích xuất từ các paper.
*   **Tính năng chống trùng lặp (US17):** Khi người dùng chuẩn bị lưu từ mới, UI sẽ hiện **Cảnh báo (Highlight màu cam/đỏ)** nếu thuật ngữ đó đã tồn tại trong Anki Deck của môn học tương ứng.
*   **Đồng bộ Anki (US15):** Có nút "Sync to Anki" lớn, cho phép preview (xem trước) giao diện thẻ bài (Mặt trước - Context/Từ vựng, Mặt sau - Nghĩa/Phân tích ngữ pháp) trước khi đẩy sang Anki Desktop qua AnkiConnect.

---

## 3. Các Luồng Người Dùng (User Flows) Tiêu Biểu

### Flow 1: Khám phá và giải quyết điểm nghẽn (Reading & Parsing)
1. User mở một Paper môn Machine Learning từ Folder bên trái.
2. Cửa sổ AI bên phải lập tức quét và đề xuất 5 thuật ngữ quan trọng trên trang 1.
3. User gặp một câu học thuật quá dài và khó hiểu. User bôi đen câu đó.
4. Chọn công cụ "Phân tích ngữ pháp". AI bẻ gãy câu thành các thành phần cơ bản (S-V-O, mệnh đề phụ) hiện ở cột phải.
5. User hiểu cấu trúc và chọn lưu cấu trúc đó lại để áp dụng cho kỹ năng Writing sau này.

### Flow 2: Đẩy kiến thức vào hệ thống ghi nhớ (Vocabulary to Anki)
1. User bôi đen một từ mới và chọn "Tra từ".
2. Cột phải hiển thị giải nghĩa Anh-Anh do AI tự tạo + Câu gốc (Context Sentence).
3. User ấn nút **"Lưu & Chuyển sang Anki"**.
4. Hệ thống kiểm tra xem từ này có bị trùng trong Deck "Machine Learning" chưa. Nếu chưa, tạo thẻ thành công.
5. Sáng hôm sau, User thấy thông báo trên Dashboard nhắc nhở mở Anki để Review thẻ đó.

---

## 4. Công nghệ Frontend Gợi ý (Cho Web App)

*   **Framework:** ReactJS hoặc Next.js (phù hợp với thư mục `frontend` hiện có nếu phát triển mở rộng).
*   **State Management:** Redux Toolkit hoặc Zustand (quản lý trạng thái các tài liệu đang đọc, tiến độ đọc).
*   **UI Component Library:** TailwindCSS + Shadcn/ui (mang lại giao diện hiện đại, tối giản giống Notion/Vercel).
*   **PDF Viewer:** `react-pdf` (để render PDF trực tiếp trên web và hỗ trợ lấy tọa độ chữ khi highlight).
*   **Markdown Rendering:** `react-markdown` (để hiển thị phản hồi của AI Copilot và preview note xuất sang Obsidian).
