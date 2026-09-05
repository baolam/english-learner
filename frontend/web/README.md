# LingoAnki Web App (`@english-learner/web`) 🌐

Phần ứng dụng Web Frontend của hệ thống LingoAnki, được xây dựng trên nền tảng **Next.js 14 (App Router)** và **React 18**. Giao diện được tối ưu theo bố cục 3 cột (Three-pane layout) phục vụ đọc tài liệu học thuật, nghiên cứu và tương tác với AI Copilot.

---

## 🚀 Công Nghệ Sử Dụng

* **Framework:** Next.js 14 (App Router), React 18, TypeScript.
* **Styling:** Tailwind CSS v3, `@tailwindcss/typography`.
* **State Management:** Zustand.
* **UI Components & Icons:** Lucide React, Date-fns, React Big Calendar, `@hello-pangea/dnd` (Drag and Drop).
* **Render Nội dung:** `react-markdown`.

---

## 📁 Cấu Trúc Thư Mục

```text
frontend/web/
├── app/                      # Next.js App Router (Pages & Layouts)
│   ├── layout.tsx            # Root layout chứa Sidebar & Navigation
│   ├── page.tsx              # Trang chủ / Dashboard
│   ├── documents/            # Quản lý tài liệu & Thư mục môn học
│   ├── terms/                # Quản lý từ vựng & thuật ngữ chuyên ngành
│   ├── anki/                 # Ôn tập & Đồng bộ thẻ Anki
│   ├── schedule/             # Lịch biểu & Quản lý Todolist
│   └── settings/             # Cấu hình phím tắt hệ thống & AnkiConnect
├── components/               # Các UI components tái sử dụng
│   ├── reader/               # Trình đọc PDF/Markdown & Menu bôi đen
│   ├── copilot/              # Cửa sổ AI Copilot chat & gợi ý từ vựng
│   ├── dashboard/            # Widget công việc, thống kê Anki
│   └── common/               # Sidebar, Header, Modals, Audio Recorder
├── store/                    # Zustand Store (Quản lý State toàn cục)
└── package.json              # Package metadata (chạy cổng 3001)
```

---

## 🛠️ Hướng Dẫn Khởi Chạy Mộc (Standalone Run)

Từ thư mục gốc dự án Monorepo:

```bash
# Chạy duy nhất Web App ở cổng 3001:
npm run dev -w @english-learner/web
```

Truy cập ứng dụng tại: `http://localhost:3001`
