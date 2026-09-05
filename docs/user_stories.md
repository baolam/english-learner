# User Stories - Dự Án LingoAnki (English Learner)

Dự án **LingoAnki** không chỉ thuần túy là một ứng dụng học ngoại ngữ, mà định hướng trở thành một **Trợ lý Học tập & Nghiên cứu Toàn diện (Learning & Research Assistant)**. Ở đây, việc phát triển kỹ năng tiếng Anh là **hệ quả tự nhiên (by-product)** của quá trình người dùng nghiên cứu tài liệu, đọc sách, đọc paper và học các môn chuyên ngành.

Dưới đây là danh sách các User Story được đúc kết, phân loại theo các vai trò và được liên kết trực tiếp với mô hình dữ liệu (Prisma Models) và Microservices trong codebase.

---

## 1. Tương Tác Với Trợ Lý AI & Nhập Liệu Đa Phương Tiện (AI Assistant & Media Input)
*(Liên quan đến các Prisma Model: `Screenshot`, `AudioRecord`, `ChatSession`, `AiChatHistory` & Microservice: `services/system-listener`, `services/ai`)*

* **US01:** Với vai trò là **người dùng**, tôi muốn nhấn phím tắt **`Win + Shift + S`** chụp màn hình chứa văn bản tiếng Anh để hệ thống tự động nhận diện chữ (Redis OCR Worker) và giúp tôi tra cứu từ vựng/thuật ngữ nhanh chóng.
* **US02:** Với vai trò là **người dùng**, tôi muốn trò chuyện trực tiếp với Trợ lý AI (AI Copilot Chat) trong ngữ cảnh của một tài liệu cụ thể (PDF/Paper) để tôi có thể hỏi về các điểm ngữ pháp khó, nhờ giải thích nghĩa sâu hơn hoặc tóm tắt ý chính.
* **US03:** Với vai trò là **Trợ lý AI**, tôi muốn tự động quét các bài báo cáo, sách mà người dùng đang đọc để đề xuất danh sách "từ vựng/thuật ngữ nên học" dựa trên tần suất xuất hiện và độ khó, giúp người dùng tiết kiệm thời gian lọc từ.
* **US04:** Với vai trò là **Trợ lý AI**, tôi muốn tự động phân tích các cấu trúc câu dài, phức tạp trong sách học thuật thành các thành phần ngữ pháp cơ bản (Subject, Verb, Object) nhờ NLTK Parser để người dùng dễ dàng hiểu (Reading) và có thể bắt chước cách hành văn (Writing) chuẩn học thuật.

---

## 2. Quản Lý Tài Liệu Học Tập (Papers, Books & Subjects)
*(Liên quan đến các Prisma Model: `Subject`, `Document`, `Highlight`)*

* **US05:** Với vai trò là **người nghiên cứu (Researcher)**, tôi muốn quản lý danh mục các file PDF (Research Papers) bằng cách lưu trữ metadata (tác giả, năm xuất bản, tag, fileType) và đường dẫn local (`localPath`/`sourceUrl`) thay vì tải trực tiếp file lên server để tiết kiệm không gian lưu trữ nhưng vẫn dễ dàng tìm kiếm.
* **US06:** Với vai trò là **người nghiên cứu**, tôi muốn bôi đen một đoạn văn bản hàn lâm phức tạp để Trợ lý AI tóm tắt hoặc diễn giải lại (`aiParaphrase`, `aiSummary`) bằng tiếng Việt/tiếng Anh đơn giản hơn.
* **US07:** Với vai trò là **người nghiên cứu**, tôi muốn tự động trích xuất các thuật ngữ chuyên ngành (terminology) từ Paper vào một danh sách từ vựng riêng để có thể ghi nhớ chúng cho việc viết báo cáo hoặc thuyết trình.
* **US08:** Với vai trò là **sinh viên (Student)**, tôi muốn tổ chức các tài liệu học tập, slide bài giảng và sách (Books) theo thư mục môn học dạng cây phân cấp (`parentId` trong `Subject`) để dễ dàng quản lý hệ thống kiến thức.
* **US09:** Với vai trò là **người đọc sách (Reader)**, tôi muốn hệ thống tự động lưu trữ và theo dõi tiến độ đọc sách (`readingProgress`, status `UNREAD/READING/COMPLETED`) để biết mình đang dừng lại ở trang/chương nào ở lần học tiếp theo.

---

## 3. Liên Kết Hệ Sinh Thái Tri Thức (Obsidian & Google Notebook)
*(Liên quan đến `obsidianSyncStatus` trong Prisma Model `Term` & Integration Settings)*

* **US10:** Với vai trò là **người nghiên cứu**, tôi muốn hệ thống có khả năng xuất (export) hoặc đồng bộ các ghi chú, highlight và từ vựng sang **Obsidian** (định dạng Markdown) để xây dựng mạng lưới tri thức (Zettelkasten/Second Brain) cho các nghiên cứu của mình.
* **US11:** Với vai trò là **người nghiên cứu**, tôi muốn liên kết các siêu dữ liệu (metadata) và tóm tắt của các paper đang quản lý với **NotebookLM** để tận dụng sức mạnh AI trong việc phân tích chéo và hỏi đáp trên tập tài liệu của mình.

---

## 4. Luyện Tập Kỹ Năng Tiếng Anh (English Skills as By-product)
*(Liên quan đến `AudioRecord` `accuracyScore`, `Term` `contextSentence` & `services/ai` Whisper STT)*

* **US12:** Với vai trò là **người học**, tôi muốn ghi âm giọng nói qua phím tắt **`Ctrl + Shift + A`** (tự động ngắt thu âm với Silero VAD) khi đọc to một đoạn trích trong sách/paper và để hệ thống nhận diện (Whisper AI Engine) tính điểm chính xác (`accuracyScore`) để tôi có thể luyện kỹ năng Phát âm (Speaking/Shadowing).
* **US13:** Với vai trò là **người học**, tôi muốn lưu lại một từ vựng mới cùng với nguyên câu chứa từ đó (`contextSentence`) từ Paper đang đọc để học được cách dùng từ đúng văn cảnh học thuật.
* **US14:** Với vai trò là **người học**, tôi muốn Trợ lý AI tự động tạo ra giải nghĩa tiếng Anh-Tiếng Anh và ví dụ ứng dụng (`aiExplanation`) cho thuật ngữ tôi vừa lưu để hiểu bản chất từ vựng thay vì chỉ dịch word-by-word.

---

## 5. Tích Hợp Anki & Ôn Tập Lặp Lại Ngắt Quãng (Spaced Repetition)
*(Liên quan đến các Prisma Model: `Deck`, `Flashcard` SM-2 Algorithm & AnkiConnect REST integration)*

* **US15:** Với vai trò là **người dùng**, tôi muốn đồng bộ các từ vựng/thuật ngữ đã lưu sang phần mềm Anki Desktop qua AnkiConnect (`externalNoteId`) để sử dụng thuật toán lặp lại ngắt quãng (Spaced Repetition) cho việc ghi nhớ dài hạn kiến thức chuyên ngành.
* **US16:** Với vai trò là **người dùng**, tôi muốn xem danh sách các thẻ "cần học mới" (New Cards) và "cần ôn tập" (Review Cards) dựa trên thuật toán SM-2 (`interval`, `repetition`, `easeFactor`, `nextReviewDate`) trực tiếp trên Web Dashboard.
* **US17:** Với vai trò là **người dùng**, tôi muốn hệ thống kiểm tra xem một thuật ngữ đã tồn tại trong bộ bài (Deck) trên Anki hay chưa để tôi không bị tạo thẻ trùng lặp.

---

## 6. Quản Lý Lịch Học & Công Việc (Schedules & Todos)
*(Liên quan đến các Prisma Model: `Schedule`, `Todo`, `Notification` & `node-cron` background scheduler)*

* **US18:** Với vai trò là **sinh viên/người nghiên cứu**, tôi muốn lên lịch trình (`startTime`, `endTime`) cho các buổi đọc paper hoặc học môn học chuyên ngành để duy trì thói quen học tập kỷ luật.
* **US19:** Với vai trò là **sinh viên/người nghiên cứu**, tôi muốn hệ thống tự động gửi thông báo (Notification) nhắc nhở trước thời điểm lịch học bắt đầu để không bỏ lỡ kế hoạch.
* **US20:** Với vai trò là **người dùng**, tôi muốn tạo và quản lý danh sách công việc (`Todo` hỗ trợ cây cha/con `parentId`) như "Đọc xong Chương 2 sách AI", "Review 50 thẻ Anki" để chia nhỏ mục tiêu và theo dõi tiến độ hàng ngày.
