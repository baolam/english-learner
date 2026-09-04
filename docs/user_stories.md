# User Stories - Dự án English Learner

Dự án không chỉ thuần túy là một ứng dụng học ngoại ngữ, mà định hướng trở thành một **trợ lý học tập toàn diện (Learning Assistant)**. Ở đây, việc phát triển kỹ năng tiếng Anh là **hệ quả tự nhiên (by-product)** của quá trình người dùng nghiên cứu tài liệu, đọc sách, đọc paper và học các môn chuyên ngành.

Dưới đây là danh sách các User Story được đúc kết, phân loại theo các vai trò cụ thể:

---

## 1. Tương tác với Trợ lý AI & Nhập liệu đa phương tiện (AI Assistant & Media)

* **US01:** Với vai trò là **người dùng**, tôi muốn gửi ảnh chụp màn hình chứa văn bản tiếng Anh vào hệ thống để mà hệ thống tự động nhận diện chữ (OCR) và giúp tôi tra cứu từ vựng/thuật ngữ nhanh chóng.
* **US02:** Với vai trò là **người dùng**, tôi muốn trò chuyện trực tiếp với Trợ lý AI (AI Chat) trong ngữ cảnh của một tài liệu cụ thể để mà tôi có thể hỏi về các điểm ngữ pháp khó, nhờ giải thích nghĩa sâu hơn hoặc tóm tắt ý chính.
* **US03:** Với vai trò là **Trợ lý AI**, tôi muốn tự động quét các bài báo cáo, sách mà người dùng đang đọc để đề xuất danh sách "từ vựng/thuật ngữ nên học" dựa trên tần suất xuất hiện và độ khó, giúp người dùng tiết kiệm thời gian lọc từ.
* **US04:** Với vai trò là **Trợ lý AI**, tôi muốn tự động phân tích các cấu trúc câu dài, phức tạp trong sách học thuật thành các thành phần ngữ pháp cơ bản để mà người dùng dễ dàng hiểu (Reading) và có thể bắt chước cách hành văn (Writing) chuẩn học thuật.

## 2. Quản lý Tài liệu học tập (Papers, Books & Subjects)

* **US05:** Với vai trò là **người nghiên cứu (Researcher)**, tôi muốn quản lý danh mục các file PDF (Research Papers) bằng cách lưu trữ metadata, tag và đường dẫn (local path/URL) thay vì tải trực tiếp file lên server để mà tôi tiết kiệm không gian lưu trữ nhưng vẫn dễ dàng tìm kiếm và truy xuất tài liệu.
* **US06:** Với vai trò là **người nghiên cứu**, tôi muốn bôi đen một đoạn văn bản hàn lâm phức tạp để mà Trợ lý AI tóm tắt hoặc diễn giải lại (paraphrase) bằng tiếng Việt/tiếng Anh đơn giản hơn.
* **US07:** Với vai trò là **người nghiên cứu**, tôi muốn tự động trích xuất các thuật ngữ chuyên ngành (terminology) từ Paper vào một danh sách từ vựng riêng để mà tôi có thể ghi nhớ chúng cho việc viết báo cáo hoặc thuyết trình.
* **US08:** Với vai trò là **sinh viên (Student)**, tôi muốn tổ chức các tài liệu học tập, slide bài giảng và sách (Books) theo từng thư mục môn học (Ví dụ: Machine Learning, Economics) để mà tôi dễ dàng quản lý hệ thống kiến thức.
* **US09:** Với vai trò là **người đọc sách (Reader)**, tôi muốn hệ thống tự động lưu trữ và theo dõi tiến độ đọc sách (Reading progress/bookmarks) để mà tôi biết mình đang dừng lại ở trang/chương nào ở lần học tiếp theo.

## 3. Liên kết Hệ sinh thái Tri thức (Obsidian & Google Notebook)

* **US10:** Với vai trò là **người nghiên cứu**, tôi muốn hệ thống có khả năng xuất (export) hoặc đồng bộ 2 chiều các ghi chú, highlight và từ vựng sang **Obsidian** (định dạng Markdown) để mà tôi có thể xây dựng mạng lưới tri thức (Zettelkasten/Second Brain) cho các nghiên cứu của mình.
* **US11:** Với vai trò là **người nghiên cứu**, tôi muốn liên kết các siêu dữ liệu (metadata) và tóm tắt của các paper đang quản lý với **Google Notebook (NotebookLM)** để mà tôi có thể tận dụng sức mạnh AI của Google trong việc phân tích chéo và hỏi đáp trên tập tài liệu của mình.

## 4. Luyện tập Kỹ năng Tiếng Anh (English Skills as By-product)

* **US12:** Với vai trò là **người học**, tôi muốn ghi âm giọng nói của mình khi đọc to một đoạn trích trong sách/paper và để hệ thống nhận diện (Whisper AI Streaming) để mà tôi có thể luyện kỹ năng Phát âm (Speaking/Shadowing) một cách tự nhiên.
* **US13:** Với vai trò là **người học**, tôi muốn lưu lại một từ vựng mới cùng với nguyên câu chứa từ đó (Context Sentence) từ Paper đang đọc để mà tôi học được cách dùng từ đúng văn cảnh học thuật.
* **US14:** Với vai trò là **người học**, tôi muốn Trợ lý AI tự động tạo ra giải nghĩa tiếng Anh-Tiếng Anh và ví dụ ứng dụng cho thuật ngữ tôi vừa lưu để mà tôi hiểu bản chất từ vựng thay vì chỉ dịch word-by-word.

## 5. Tích hợp Anki & Ôn tập (Spaced Repetition)

* **US15:** Với vai trò là **người dùng**, tôi muốn đồng bộ các từ vựng/thuật ngữ đã lưu sang phần mềm Anki Desktop để mà tôi có thể sử dụng thuật toán lặp lại ngắt quãng (Spaced Repetition) cho việc ghi nhớ dài hạn kiến thức chuyên ngành.
* **US16:** Với vai trò là **người dùng**, tôi muốn xem danh sách các thẻ "cần học mới" (New Cards) và "cần ôn tập" (Review Cards) trong ngày từ Anki trực tiếp trên ứng dụng này để mà tôi biết được khối lượng bài tập cần hoàn thành.
* **US17:** Với vai trò là **người dùng**, tôi muốn tìm kiếm xem một thuật ngữ đã tồn tại trong bộ bài (Deck) môn học trên Anki của tôi hay chưa để mà tôi không bị mất công tạo thẻ trùng lặp.

## 6. Quản lý Lịch học & Công việc (Schedules & Todos)

* **US18:** Với vai trò là **sinh viên/người nghiên cứu**, tôi muốn lên lịch trình cho các buổi đọc paper hoặc học môn học chuyên ngành (thời gian bắt đầu, kết thúc) để mà tôi có thể duy trì thói quen học tập kỷ luật.
* **US19:** Với vai trò là **sinh viên/người nghiên cứu**, tôi muốn hệ thống tự động gửi thông báo (Notification) nhắc nhở trước 15 phút, 5 phút và ngay lúc lịch học bắt đầu để mà tôi không bỏ lỡ kế hoạch.
* **US20:** Với vai trò là **người dùng**, tôi muốn tạo và quản lý một danh sách các công việc (Todo list) như "Đọc xong Chương 2 sách AI", "Review 50 thẻ Anki môn Toán" để mà tôi có thể chia nhỏ mục tiêu và theo dõi tiến độ hàng ngày.
