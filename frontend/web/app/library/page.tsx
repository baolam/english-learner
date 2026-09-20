'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Library as LibraryIcon,
  BookOpen,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Tag as TagIcon,
  FolderKanban,
  X,
  CheckCircle,
  Clock,
  BookMarked
} from 'lucide-react';

interface Tag {
  id: string;
  name: string;
}

interface StudySession {
  id: string;
  title: string;
}

interface DocumentItem {
  id: string;
  title: string;
  content?: string;
  author?: string;
  publishedYear?: number;
  tags?: Tag[];
  fileType?: string;
  status: 'UNREAD' | 'READING' | 'COMPLETED' | string;
  readingProgress?: string;
  studySessionId?: string;
  studySession?: StudySession;
  updatedAt: string;
}

export default function LibraryPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publishedYear: '',
    fileType: 'TEXT',
    status: 'UNREAD',
    studySessionId: '',
    content: '',
    tags: ''
  });

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (searchQuery) params.search = searchQuery;

      const res = await axios.get('http://localhost:3000/api/documents', { params });
      setDocuments(res.data.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, searchQuery]);

  const fetchStudySessions = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/study-sessions?limit=100');
      setStudySessions(res.data.data || []);
    } catch (error) {
      console.error('Error fetching study sessions:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchStudySessions();
  }, [fetchDocuments]);

  const openCreateModal = () => {
    setEditingDoc(null);
    setFormData({
      title: '',
      author: '',
      publishedYear: '',
      fileType: 'TEXT',
      status: 'UNREAD',
      studySessionId: '',
      content: '',
      tags: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (doc: DocumentItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      author: doc.author || '',
      publishedYear: doc.publishedYear ? String(doc.publishedYear) : '',
      fileType: doc.fileType || 'TEXT',
      status: doc.status,
      studySessionId: doc.studySessionId || '',
      content: doc.content || '',
      tags: doc.tags?.map(t => t.name).join(', ') || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear, 10) : undefined,
        studySessionId: formData.studySessionId || undefined
      };

      if (editingDoc) {
        await axios.put(`http://localhost:3000/api/documents/${editingDoc.id}`, payload);
      } else {
        await axios.post('http://localhost:3000/api/documents', payload);
      }
      setIsModalOpen(false);
      fetchDocuments();
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document.');
    }
  };

  const handleDeleteDocument = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/documents/${id}`);
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><BookMarked size={12}/> Reading</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle size={12}/> Completed</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"><Clock size={12}/> Unread</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <LibraryIcon className="w-8 h-8 text-blue-600" />
            Library
          </h1>
          <p className="text-slate-500 mt-1">Manage and read your English learning materials and books.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
        >
          <Plus size={20} />
          Add Material
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search documents by title, author, or tags..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">Status: All</option>
            <option value="UNREAD">Status: Unread</option>
            <option value="READING">Status: Reading</option>
            <option value="COMPLETED">Status: Completed</option>
          </select>
        </div>
      </div>

      {/* Document Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
          <BookOpen size={48} className="text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-600">Your library is empty</p>
          <p className="text-sm mt-1">Uploaded documents and learning materials will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-slate-800 truncate" title={doc.title}>
                    {doc.title}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => openEditModal(doc, e)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteDocument(doc.id, e)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {getStatusBadge(doc.status)}
                  <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded font-medium">{doc.fileType || 'TEXT'}</span>
                </div>

                {doc.author && (
                  <p className="text-xs text-slate-500 mb-2">By {doc.author} {doc.publishedYear ? `(${doc.publishedYear})` : ''}</p>
                )}

                {doc.studySession && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      <FolderKanban size={12} /> {doc.studySession.title}
                    </span>
                  </div>
                )}

                {doc.content && (
                  <p className="text-xs text-slate-600 line-clamp-3 mb-3 bg-slate-50 p-2.5 rounded border border-slate-100">
                    {doc.content}
                  </p>
                )}

                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {doc.tags.map(t => (
                      <span key={t.id} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600">
                        <TagIcon size={10} /> {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                <span>Updated: {new Date(doc.updatedAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-800">
                {editingDoc ? 'Edit Material' : 'Add Material'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. English Grammar in Use"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
                  <input
                    type="text"
                    placeholder="Raymond Murphy"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Published Year</label>
                  <input
                    type="number"
                    placeholder="2022"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                    value={formData.publishedYear}
                    onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="UNREAD">Unread</option>
                    <option value="READING">Reading</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                  >
                    <option value="TEXT">TEXT</option>
                    <option value="PDF">PDF</option>
                    <option value="EPUB">EPUB</option>
                    <option value="URL">URL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link to Study Session</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                  value={formData.studySessionId}
                  onChange={(e) => setFormData({ ...formData, studySessionId: e.target.value })}
                >
                  <option value="">-- No Session --</option>
                  {studySessions.map(session => (
                    <option key={session.id} value={session.id}>{session.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content / Excerpt</label>
                <textarea
                  rows={3}
                  placeholder="Paste text snippet or notes..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="grammar, book, reading"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  {editingDoc ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
