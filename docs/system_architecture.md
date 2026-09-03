# Tổng hợp: Kiến trúc & Giải pháp xây dựng Hệ thống Hỗ trợ Đọc hiểu Tiếng Anh (Kiến trúc Hybrid)

Tài liệu này tổng hợp các công cụ, thư viện, mô hình AI và thiết kế luồng xử lý (Hybrid) để phát triển một hệ thống EdTech chuyên biệt cho rèn luyện kỹ năng đọc hiểu Tiếng Anh.

---

## 1. Mục tiêu cốt lõi: Các khía cạnh đọc hiểu cần rèn luyện
1. **Skimming:** Tìm ý chính của bài/đoạn văn.
2. **Scanning:** Tìm kiếm thông tin, dữ kiện chi tiết.
3. **Inference:** Khả năng suy luận từ các thông tin ẩn.
4. **Vocabulary in Context:** Đoán nghĩa từ vựng dựa vào ngữ cảnh.
5. **Text Structure:** Hiểu cấu trúc bài viết và sự liên kết.
6. **Author's Purpose:** Xác định mục đích và thái độ của tác giả.

---

## 2. Kiến trúc Module Xử Lý (Tech Stack Đề xuất)

### 2.1. Module Tiền xử lý dữ liệu đầu vào (Data Ingestion)
Hệ thống nhận 2 luồng dữ liệu đầu vào chính:
*   **Link Website:** Sử dụng `newspaper3k` hoặc `trafilatura` để cạo nội dung văn bản chính, loại bỏ quảng cáo/menu.
*   **Giấy ghi chú Xournal (PDF / .xoj):**
    *   **PDF:** Dùng `PyMuPDF` (`fitz`) để trích xuất chữ.
    *   **File .xoj / .xopp:** Dùng thư viện `gzip` và `xml.etree.ElementTree` để giải nén và đọc text chú thích.

### 2.2. Module Tương tác hỗ trợ đọc (Interactive Reading Tools)
*   **Tra từ điển (Pop-up Dictionary):** Free Dictionary API / Wordnik API.
*   **Đánh giá độ khó:** `textstat`, `spaCy`.
*   **Ôn tập từ vựng (SRS):** `fsrs4python`.

---

## 3. Kiến trúc Động cơ AI (Hybrid AI Engine: Local + Cloud)

Hệ thống được thiết kế theo mô hình **Hybrid (Lai)** nhằm tận dụng tối đa phần cứng cá nhân (GPU MX130 - 2GB VRAM) để tiết kiệm chi phí, đồng thời dùng Cloud LLM để xử lý các tác vụ phức tạp.

### 3.1. Phân luồng xử lý tự động (Routing Logic)
Backend sẽ đếm số lượng từ (word count) của đầu vào để quyết định điều phối công việc:

**Luồng 1: Xử lý tại máy cục bộ (Local GPU MX130) - Dùng Questgen.ai**
*   **Điều kiện:** Đoạn văn bản ngắn (dưới 400 từ).
*   **Nhiệm vụ:** Load mô hình T5-base và Sense2vec lên VRAM của GPU MX130 để tự động tạo câu hỏi Trắc nghiệm (MCQs), Đúng/Sai.
*   **Lợi ích:** Tiết kiệm gọi API, phản hồi nhanh cho các đoạn văn ngắn. (Tránh truyền đoạn văn quá dài để không bị lỗi CUDA Out of Memory do MX130 chỉ có 2GB VRAM).

**Luồng 2: Xử lý trên Cloud - Dùng Gemini 1.5 Flash API**
*   **Điều kiện:** Toàn bộ file PDF dài (từ Xournal), bài báo > 400 từ, hoặc các yêu cầu phức tạp.
*   **Nhiệm vụ:** Tóm tắt, sinh bộ đề thi hoàn chỉnh từ tài liệu khổng lồ (nhờ context window 1 triệu token của Gemini).

### 3.2. Tính năng Gia sư Ảo (Tích hợp chéo)
*   Questgen.ai tạo câu hỏi tiếng Anh ở Local. Khi người dùng chọn sai đáp án, hệ thống gọi **Gemini API** để đóng vai gia sư: Đưa ra lời giải thích chi tiết bằng Tiếng Việt tại sao đáp án đó sai dựa trên ngữ cảnh bài đọc.
*   Chấm điểm câu hỏi tự luận ngắn: Questgen đặt câu hỏi, người dùng trả lời, Gemini API chấm điểm ngữ pháp và ý nghĩa.

---

### Tóm tắt Cài đặt (Dành cho Questgen Local)
Để Questgen nhận diện GPU MX130, cần cài đặt Pytorch bản hỗ trợ CUDA:
```bash
# Cài đặt PyTorch với CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Cài đặt Questgen
pip install git+https://github.com/ramsrigouthamg/Questgen.ai
pip install git+https://github.com/boudinfl/pke.git
python -m nltk.downloader universal_tagset
python -m spacy download en_core_web_sm
```
