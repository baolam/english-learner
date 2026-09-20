/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  Calendar,
  Save,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  CheckCircle2,
  Circle,
  MapPin,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  ListTodo,
  Sparkles,
  ExternalLink,
  Eye,
  Edit3,
  Globe
} from 'lucide-react';

interface Todo {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  scheduleId?: string;
}

export interface Widget {
  id: string;
  type: 'markdown' | 'location' | 'gallery' | 'resources' | 'todolist';
  title: string;
  content: any;
}

interface Schedule {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  widgets?: string;
  startTime: string;
  endTime: string;
  todos: Todo[];
}

const EMOJI_OPTIONS = ['🎯', '📍', '✈️', '📖', '🚀', '💻', '🏛️', '🏕️', '🎨', '🏆', '🍔', '☕', '🎮', '🌟', '💼', '🏡'];

const COVER_PRESETS = [
  'linear-gradient(to right, #3b82f6, #8b5cf6)',
  'linear-gradient(to right, #06b6d4, #3b82f6)',
  'linear-gradient(to right, #10b981, #059669)',
  'linear-gradient(to right, #f59e0b, #ef4444)',
  'linear-gradient(to right, #ec4899, #8b5cf6)',
  'linear-gradient(to right, #1e293b, #334155)',
];

export default function ScheduleDetailPage() {
  const params = useParams();
  const scheduleId = params?.id as string;

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Customization States
  const [icon, setIcon] = useState('🎯');
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0]);
  const [title, setTitle] = useState('');
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');

  // Markdown Tab View state per markdown widget
  const [activeMarkdownTab, setActiveMarkdownTab] = useState<{ [key: string]: 'edit' | 'preview' }>({});

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3000/api/schedules/${scheduleId}`);
      const data: Schedule = res.data;
      setSchedule(data);
      setTitle(data.title);
      setIcon(data.icon || '🎯');
      setCoverImage(data.coverImage || COVER_PRESETS[0]);

      if (data.widgets) {
        try {
          const parsed = JSON.parse(data.widgets);
          setWidgets(parsed);
        } catch {
          setWidgets(createDefaultWidgets(data.description || ''));
        }
      } else {
        setWidgets(createDefaultWidgets(data.description || ''));
      }
    } catch (error) {
      console.error('Error fetching schedule detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultWidgets = (desc: string): Widget[] => {
    const defaultList: Widget[] = [];
    if (desc) {
      defaultList.push({
        id: 'w-markdown-default',
        type: 'markdown',
        title: 'Mô Tả & Ghi Chú Chi Tiết',
        content: desc,
      });
    } else {
      defaultList.push({
        id: 'w-markdown-default',
        type: 'markdown',
        title: 'Mô Tả & Ghi Chú Chi Tiết',
        content: '### Chào mừng đến trang tùy biến!\nBạn có thể viết Markdown, danh sách, tạo bảng hoặc nhúng ảnh ở đây.',
      });
    }
    defaultList.push({
      id: 'w-todos-default',
      type: 'todolist',
      title: 'Danh Sách Công Việc (Daily Todos)',
      content: {},
    });
    return defaultList;
  };

  useEffect(() => {
    if (scheduleId) {
      fetchSchedule();
    }
  }, [scheduleId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`http://localhost:3000/api/schedules/${scheduleId}`, {
        title,
        icon,
        coverImage,
        widgets: JSON.stringify(widgets),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Có lỗi xảy ra khi lưu trang!');
    } finally {
      setSaving(false);
    }
  };

  const addWidget = (type: Widget['type']) => {
    const newId = `w-${type}-${Date.now()}`;
    let initialContent: any = '';

    if (type === 'markdown') {
      initialContent = '## Nội dung mới\n- Thêm thông tin ở đây...';
    } else if (type === 'location') {
      initialContent = { name: '', address: '', mapUrl: '', notes: '' };
    } else if (type === 'gallery') {
      initialContent = { images: [] };
    } else if (type === 'resources') {
      initialContent = { links: [] };
    } else if (type === 'todolist') {
      initialContent = {};
    }

    const titles: Record<Widget['type'], string> = {
      markdown: 'Ghi Chú Rich Text',
      location: 'Địa Điểm & Bản Đồ',
      gallery: 'Bộ Sưu Tập Hình Ảnh',
      resources: 'Liên Kết & Tài Nguyên',
      todolist: 'Nhiệm Vụ Đánh Dấu',
    };

    setWidgets([...widgets, { id: newId, type, title: titles[type], content: initialContent }]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;
    const updated = [...widgets];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setWidgets(updated);
  };

  const updateWidgetContent = (id: string, newContent: any) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, content: newContent } : w)));
  };

  const updateWidgetTitle = (id: string, newTitle: string) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, title: newTitle } : w)));
  };

  const toggleTodoCompletion = async (todoId: string, currentStatus: boolean) => {
    try {
      await axios.put(`http://localhost:3000/api/todos/${todoId}`, {
        isCompleted: !currentStatus,
      });
      if (schedule) {
        setSchedule({
          ...schedule,
          todos: schedule.todos.map((t) => (t.id === todoId ? { ...t, isCompleted: !currentStatus } : t)),
        });
      }
    } catch (error) {
      console.error('Error toggling todo status:', error);
    }
  };

  const handleCreateTodo = async () => {
    if (!newTodoTitle.trim() || !scheduleId) return;
    try {
      const res = await axios.post('http://localhost:3000/api/todos', {
        title: newTodoTitle,
        scheduleId: scheduleId,
      });
      if (schedule) {
        setSchedule({
          ...schedule,
          todos: [...schedule.todos, res.data],
        });
      }
      setNewTodoTitle('');
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Đang tải trang tùy biến...</p>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="flex-1 p-8 text-center bg-slate-50 min-h-screen">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy sự kiện!</h2>
        <Link href="/schedules" className="text-blue-600 underline mt-4 inline-block">
          Quay lại danh sách lịch
        </Link>
      </div>
    );
  }

  const completedTodosCount = schedule.todos.filter((t) => t.isCompleted).length;
  const totalTodosCount = schedule.todos.length;
  const progressPercentage = totalTodosCount > 0 ? Math.round((completedTodosCount / totalTodosCount) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 min-h-screen pb-20">
      {/* Top Header Controls */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-3 flex justify-between items-center shadow-sm">
        <Link href="/schedules" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition font-medium text-sm">
          <ArrowLeft size={18} />
          Quay lại Lịch trình
        </Link>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              ✓ Đã lưu thay đổi!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold text-sm transition shadow-sm disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Đang lưu...' : 'Lưu Trang Tùy Biến'}
          </button>
        </div>
      </div>

      {/* Hero / Cover Banner Header */}
      <div className="relative">
        <div
          className="h-56 w-full transition-all duration-500 relative group"
          style={{
            background: coverImage.startsWith('http') ? `url(${coverImage}) center/cover no-repeat` : coverImage,
          }}
        >
          <div className="absolute top-4 right-8 bg-black/40 backdrop-blur-md rounded-lg p-2 flex gap-1 opacity-90 group-hover:opacity-100 transition">
            {COVER_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setCoverImage(preset)}
                className={`w-6 h-6 rounded-full border-2 transition ${coverImage === preset ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
                style={{ background: preset }}
                title="Đổi màu gradient header"
              />
            ))}
          </div>
        </div>

        {/* Floating Icon Emoji & Main Title */}
        <div className="max-w-4xl mx-auto px-6 relative -mt-16">
          <div className="flex items-end gap-4">
            {/* Emoji Picker */}
            <div className="relative group">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center text-5xl cursor-pointer hover:scale-105 transition">
                {icon}
              </div>
              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-3 hidden group-hover:grid grid-cols-4 gap-2 z-50 w-48">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setIcon(e)}
                    className="text-2xl hover:bg-slate-100 p-2 rounded-lg transition"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 pb-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-3xl font-extrabold text-slate-800 bg-transparent border-b-2 border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none transition py-1"
                placeholder="Tiêu đề Sự kiện / Địa điểm..."
              />
              <div className="flex items-center gap-4 text-slate-500 text-xs font-medium mt-1">
                <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                  <Calendar size={14} className="text-blue-600" />
                  {new Date(schedule.startTime).toLocaleDateString('vi-VN')} - {new Date(schedule.endTime).toLocaleDateString('vi-VN')}
                </span>
                <span>•</span>
                <span>Nhiệm vụ: {completedTodosCount}/{totalTodosCount} hoàn thành ({progressPercentage}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Widgets Container */}
      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        {widgets.map((widget, index) => (
          <div
            key={widget.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition duration-200 group overflow-hidden"
          >
            {/* Widget Card Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                {widget.type === 'markdown' && <FileText size={18} className="text-blue-600" />}
                {widget.type === 'location' && <MapPin size={18} className="text-emerald-600" />}
                {widget.type === 'gallery' && <ImageIcon size={18} className="text-purple-600" />}
                {widget.type === 'resources' && <LinkIcon size={18} className="text-amber-600" />}
                {widget.type === 'todolist' && <ListTodo size={18} className="text-indigo-600" />}

                <input
                  type="text"
                  value={widget.title}
                  onChange={(e) => updateWidgetTitle(widget.id, e.target.value)}
                  className="font-semibold text-slate-800 text-base bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition px-1 py-0.5"
                />
              </div>

              {/* Widget Controls */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                <button
                  onClick={() => moveWidget(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition disabled:opacity-30"
                  title="Di chuyển lên"
                >
                  <MoveUp size={16} />
                </button>
                <button
                  onClick={() => moveWidget(index, 'down')}
                  disabled={index === widgets.length - 1}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition disabled:opacity-30"
                  title="Di chuyển xuống"
                >
                  <MoveDown size={16} />
                </button>
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-1"
                  title="Xóa widget"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Widget Body Content */}
            <div className="p-5">
              {/* WIDGET 1: MARKDOWN EDITOR + LIVE PREVIEW */}
              {widget.type === 'markdown' && (
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setActiveMarkdownTab({ ...activeMarkdownTab, [widget.id]: 'edit' })
                        }
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition ${
                          (activeMarkdownTab[widget.id] || 'edit') === 'edit'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <Edit3 size={14} /> Soạn Thảo
                      </button>
                      <button
                        onClick={() =>
                          setActiveMarkdownTab({ ...activeMarkdownTab, [widget.id]: 'preview' })
                        }
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition ${
                          activeMarkdownTab[widget.id] === 'preview'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <Eye size={14} /> Xem Trước (Live Preview)
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400">Hỗ trợ đầy đủ cú pháp Markdown</span>
                  </div>

                  {(activeMarkdownTab[widget.id] || 'edit') === 'edit' ? (
                    <textarea
                      rows={6}
                      value={widget.content}
                      onChange={(e) => updateWidgetContent(widget.id, e.target.value)}
                      placeholder="Nhập nội dung markdown tự do tại đây (H1, H2, Bold, Bảng, Danh sách, Nhúng ảnh...)..."
                      className="w-full p-4 border border-slate-200 rounded-lg font-mono text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                    />
                  ) : (
                    <div className="prose prose-slate max-w-none bg-slate-50/50 p-5 rounded-lg border border-slate-200 min-h-[120px]">
                      <ReactMarkdown>{widget.content || '*Chưa có nội dung.*'}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}

              {/* WIDGET 2: LOCATION & MAP */}
              {widget.type === 'location' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Tên Địa Điểm / Vị Trí</label>
                      <input
                        type="text"
                        value={widget.content.name || ''}
                        onChange={(e) =>
                          updateWidgetContent(widget.id, { ...widget.content, name: e.target.value })
                        }
                        placeholder="Ví dụ: Công viên 23/9, Trung tâm Hội nghị..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Địa Chỉ Chi Tiết</label>
                      <input
                        type="text"
                        value={widget.content.address || ''}
                        onChange={(e) =>
                          updateWidgetContent(widget.id, { ...widget.content, address: e.target.value })
                        }
                        placeholder="Số nhà, Tên đường, Quận/Huyện..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Google Maps / Link Chỉ Đường</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={widget.content.mapUrl || ''}
                        onChange={(e) =>
                          updateWidgetContent(widget.id, { ...widget.content, mapUrl: e.target.value })
                        }
                        placeholder="https://maps.google.com/..."
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      {widget.content.mapUrl && (
                        <a
                          href={widget.content.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition"
                        >
                          <Globe size={14} /> Mở Bản Đồ
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Ghi Chú Thêm Cho Địa Điểm</label>
                    <textarea
                      rows={2}
                      value={widget.content.notes || ''}
                      onChange={(e) =>
                        updateWidgetContent(widget.id, { ...widget.content, notes: e.target.value })
                      }
                      placeholder="Hướng dẫn giữ xe, người liên hệ, giờ mở cửa..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* WIDGET 3: IMAGE GALLERY */}
              {widget.type === 'gallery' && (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {(widget.content.images || []).map((imgUrl: string, idx: number) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 h-36 bg-slate-100">
                        <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => {
                            const newImgs = [...widget.content.images];
                            newImgs.splice(idx, 1);
                            updateWidgetContent(widget.id, { ...widget.content, images: newImgs });
                          }}
                          className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-rose-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      id={`img-input-${widget.id}`}
                      placeholder="Dán URL Hình Ảnh (https://...)"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const inputEl = document.getElementById(`img-input-${widget.id}`) as HTMLInputElement;
                        if (inputEl && inputEl.value.trim()) {
                          const newImgs = [...(widget.content.images || []), inputEl.value.trim()];
                          updateWidgetContent(widget.id, { ...widget.content, images: newImgs });
                          inputEl.value = '';
                        }
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1"
                    >
                      <Plus size={16} /> Thêm Ảnh
                    </button>
                  </div>
                </div>
              )}

              {/* WIDGET 4: RESOURCES & LINKS */}
              {widget.type === 'resources' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {(widget.content.links || []).map((link: { title: string; url: string }, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-slate-100 transition">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 font-medium text-blue-600 hover:underline text-sm"
                        >
                          <ExternalLink size={16} />
                          {link.title || link.url}
                        </a>
                        <button
                          onClick={() => {
                            const newLinks = [...widget.content.links];
                            newLinks.splice(idx, 1);
                            updateWidgetContent(widget.id, { ...widget.content, links: newLinks });
                          }}
                          className="text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    <input
                      type="text"
                      id={`link-title-${widget.id}`}
                      placeholder="Tên Tài nguyên / Tài liệu"
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id={`link-url-${widget.id}`}
                        placeholder="Đường dẫn URL (https://...)"
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const titleEl = document.getElementById(`link-title-${widget.id}`) as HTMLInputElement;
                          const urlEl = document.getElementById(`link-url-${widget.id}`) as HTMLInputElement;
                          if (urlEl && urlEl.value.trim()) {
                            const newLinks = [
                              ...(widget.content.links || []),
                              { title: titleEl?.value.trim() || urlEl.value.trim(), url: urlEl.value.trim() },
                            ];
                            updateWidgetContent(widget.id, { ...widget.content, links: newLinks });
                            titleEl.value = '';
                            urlEl.value = '';
                          }
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1"
                      >
                        <Plus size={16} /> Thêm
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* WIDGET 5: LINKED TODOS CHECKLIST */}
              {widget.type === 'todolist' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {schedule.todos.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white shadow-2xs hover:border-slate-300 transition"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <button onClick={() => toggleTodoCompletion(todo.id, todo.isCompleted)}>
                            {todo.isCompleted ? (
                              <CheckCircle2 size={20} className="text-emerald-500" />
                            ) : (
                              <Circle size={20} className="text-slate-300 hover:text-slate-400" />
                            )}
                          </button>
                          <span
                            className={`text-sm font-medium ${
                              todo.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'
                            }`}
                          >
                            {todo.title}
                          </span>
                        </div>
                      </div>
                    ))}

                    {schedule.todos.length === 0 && (
                      <p className="text-sm text-slate-400 italic py-2">Chưa có nhiệm vụ nào gắn với sự kiện này.</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newTodoTitle}
                      onChange={(e) => setNewTodoTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateTodo()}
                      placeholder="Thêm nhanh công việc hàng ngày..."
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={handleCreateTodo}
                      disabled={!newTodoTitle.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1 disabled:opacity-50"
                    >
                      <Plus size={16} /> Thêm Task
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add New Widget Bar */}
        <div className="p-6 bg-slate-100/80 border-2 border-dashed border-slate-300 rounded-xl text-center">
          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-blue-600" />
            Thêm Khối Nội Dung Tùy Biến Cho Trang
          </h4>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => addWidget('markdown')}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs hover:shadow-xs transition"
            >
              <FileText size={16} className="text-blue-600" /> + Soạn Thảo Markdown
            </button>
            <button
              onClick={() => addWidget('location')}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs hover:shadow-xs transition"
            >
              <MapPin size={16} className="text-emerald-600" /> + Địa Điểm / Bản Đồ
            </button>
            <button
              onClick={() => addWidget('gallery')}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs hover:shadow-xs transition"
            >
              <ImageIcon size={16} className="text-purple-600" /> + Bộ Sưu Tập Ảnh
            </button>
            <button
              onClick={() => addWidget('resources')}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs hover:shadow-xs transition"
            >
              <LinkIcon size={16} className="text-amber-600" /> + Liên Kết Tài Nguyên
            </button>
            <button
              onClick={() => addWidget('todolist')}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs hover:shadow-xs transition"
            >
              <ListTodo size={16} className="text-indigo-600" /> + Danh Sách Checklist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
