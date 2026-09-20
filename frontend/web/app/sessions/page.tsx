'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Clock,
  Tag as TagIcon,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Headphones,
  Link2,
  X,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  Archive
} from 'lucide-react';

interface Tag {
  id: string;
  name: string;
}

interface Term {
  id: string;
  term: string;
  contextSentence?: string;
  aiExplanation?: string;
}

interface Document {
  id: string;
  title: string;
  fileType?: string;
  status?: string;
}

interface Screenshot {
  id: string;
  filename: string;
  windowTitle?: string;
  capturedAt: string;
}

interface AudioRecord {
  id: string;
  filename: string;
  duration?: number;
  capturedAt: string;
}

interface ConceptRelation {
  id: string;
  relationType: string;
  sourceTerm: Term;
  targetTerm: Term;
}

interface StudySession {
  id: string;
  title: string;
  category: 'MEETING' | 'LECTURE' | 'RESEARCH' | 'ENGLISH' | 'CODING' | string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED' | string;
  aiSummary?: string;
  tags?: Tag[];
  startedAt: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
    terms: number;
    screenshots: number;
    audioRecords: number;
    conceptRelations: number;
  };
  documents?: Document[];
  terms?: Term[];
  screenshots?: Screenshot[];
  audioRecords?: AudioRecord[];
  conceptRelations?: ConceptRelation[];
}

const CATEGORIES = ['ALL', 'MEETING', 'LECTURE', 'RESEARCH', 'ENGLISH', 'CODING'];
const STATUSES = ['ALL', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'];

export default function StudySessionsPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'ENGLISH',
    status: 'ACTIVE',
    aiSummary: '',
    tags: ''
  });

  // Detail Modal State
  const [detailSession, setDetailSession] = useState<StudySession | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Concept Relation Creation State
  const [sourceTermId, setSourceTermId] = useState('');
  const [targetTermId, setTargetTermId] = useState('');
  const [relationType, setRelationType] = useState('RELATED_TO');

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (searchQuery) params.search = searchQuery;

      const res = await axios.get('http://localhost:3000/api/study-sessions', { params });
      setSessions(res.data.data || []);
    } catch (error) {
      console.error('Error fetching study sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const openCreateModal = () => {
    setEditingSession(null);
    setFormData({
      title: '',
      category: 'ENGLISH',
      status: 'ACTIVE',
      aiSummary: '',
      tags: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (session: StudySession, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingSession(session);
    setFormData({
      title: session.title,
      category: session.category,
      status: session.status,
      aiSummary: session.aiSummary || '',
      tags: session.tags?.map(t => t.name).join(', ') || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSession) {
        await axios.put(`http://localhost:3000/api/study-sessions/${editingSession.id}`, formData);
      } else {
        await axios.post('http://localhost:3000/api/study-sessions', formData);
      }
      setIsModalOpen(false);
      fetchSessions();
    } catch (error) {
      console.error('Error saving study session:', error);
      alert('Failed to save study session.');
    }
  };

  const handleDeleteSession = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Are you sure you want to delete this study session?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/study-sessions/${id}`);
      if (detailSession?.id === id) setDetailSession(null);
      fetchSessions();
    } catch (error) {
      console.error('Error deleting study session:', error);
      alert('Failed to delete study session.');
    }
  };

  const openDetailModal = async (session: StudySession) => {
    try {
      setIsDetailLoading(true);
      const res = await axios.get(`http://localhost:3000/api/study-sessions/${session.id}`);
      setDetailSession(res.data);
    } catch (error) {
      console.error('Error fetching session details:', error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleAddConceptRelation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailSession || !sourceTermId || !targetTermId) return;
    if (sourceTermId === targetTermId) {
      alert('Source and Target terms must be different.');
      return;
    }
    try {
      await axios.post(`http://localhost:3000/api/study-sessions/${detailSession.id}/relations`, {
        sourceTermId,
        targetTermId,
        relationType
      });
      openDetailModal(detailSession);
      setSourceTermId('');
      setTargetTermId('');
    } catch (error) {
      console.error('Error creating concept relation:', error);
      alert('Failed to add concept relation.');
    }
  };

  const handleDeleteConceptRelation = async (relationId: string) => {
    if (!detailSession) return;
    try {
      await axios.delete(`http://localhost:3000/api/study-sessions/relations/${relationId}`);
      openDetailModal(detailSession);
    } catch (error) {
      console.error('Error deleting concept relation:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><PlayCircle size={12}/> Active</span>;
      case 'PAUSED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><PauseCircle size={12}/> Paused</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"><CheckCircle size={12}/> Completed</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"><Archive size={12}/> {status}</span>;
    }
  };

  const getCategoryBadge = (category: string) => {
    return (
      <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        {category}
      </span>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-blue-600" />
            Study Sessions
          </h1>
          <p className="text-slate-500 mt-1">Organize learning goals, notes, concepts, and materials into active study sessions.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
        >
          <Plus size={20} />
          New Session
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search study sessions..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>Category: {cat}</option>
              ))}
            </select>
          </div>

          <select
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {STATUSES.map(st => (
              <option key={st} value={st}>Status: {st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
          <FolderKanban size={48} className="text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-600">No study sessions found</p>
          <p className="text-sm mt-1">Create your first study session to group your reading, vocabulary, and notes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => openDetailModal(session)}
              className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-lg text-slate-800 group-hover:text-blue-600 transition truncate">
                    {session.title}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={(e) => openEditModal(session, e)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {getStatusBadge(session.status)}
                  {getCategoryBadge(session.category)}
                </div>

                {session.aiSummary && (
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {session.aiSummary}
                  </p>
                )}

                {session.tags && session.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {session.tags.map(t => (
                      <span key={t.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                        <TagIcon size={10} /> {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1" title="Documents"><FileText size={14} /> {session._count?.documents || 0}</span>
                  <span className="flex items-center gap-1" title="Terms"><BookOpen size={14} /> {session._count?.terms || 0}</span>
                  <span className="flex items-center gap-1" title="Screenshots"><ImageIcon size={14} /> {session._count?.screenshots || 0}</span>
                  <span className="flex items-center gap-1" title="Audios"><Headphones size={14} /> {session._count?.audioRecords || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(session.updatedAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-800">
                {editingSession ? 'Edit Study Session' : 'New Study Session'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. English Grammar & Daily Conversation"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.filter(c => c !== 'ALL').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {STATUSES.filter(s => s !== 'ALL').map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Summary / Goal</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of session goals..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                  value={formData.aiSummary}
                  onChange={(e) => setFormData({ ...formData, aiSummary: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="grammar, speaking, ielts"
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
                  {editingSession ? 'Update Session' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Details Drawer / Modal */}
      {detailSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8" onClick={() => setDetailSession(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-800">{detailSession.title}</h2>
                  {getStatusBadge(detailSession.status)}
                  {getCategoryBadge(detailSession.category)}
                </div>
                <p className="text-xs text-slate-400 mt-1">Started: {new Date(detailSession.startedAt).toLocaleString('vi-VN')}</p>
              </div>
              <button onClick={() => setDetailSession(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isDetailLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  {detailSession.aiSummary && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">Session Summary</h4>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{detailSession.aiSummary}</p>
                    </div>
                  )}

                  {/* Linked Terms & Vocabulary */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <BookOpen size={20} className="text-blue-600" />
                      Terms & Concepts ({detailSession.terms?.length || 0})
                    </h3>
                    {detailSession.terms && detailSession.terms.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {detailSession.terms.map((t) => (
                          <div key={t.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="font-semibold text-slate-800">{t.term}</span>
                            {t.contextSentence && <p className="text-xs text-slate-500 mt-1 italic">&quot;{t.contextSentence}&quot;</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No terms associated with this session yet.</p>
                    )}
                  </div>

                  {/* Concept Relations Manager */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Link2 size={20} className="text-indigo-600" />
                      Concept Relations Map
                    </h3>

                    {/* Relation List */}
                    {detailSession.conceptRelations && detailSession.conceptRelations.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        {detailSession.conceptRelations.map((rel) => (
                          <div key={rel.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-800">{rel.sourceTerm?.term}</span>
                              <span className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 font-semibold rounded">{rel.relationType}</span>
                              <span className="font-medium text-slate-800">{rel.targetTerm?.term}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteConceptRelation(rel.id)}
                              className="text-slate-400 hover:text-red-600 p-1"
                              title="Delete Relation"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 mb-4">No concept relations created for terms in this session.</p>
                    )}

                    {/* Add New Relation Form */}
                    {detailSession.terms && detailSession.terms.length >= 2 && (
                      <form onSubmit={handleAddConceptRelation} className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200">
                        <select
                          required
                          value={sourceTermId}
                          onChange={(e) => setSourceTermId(e.target.value)}
                          className="px-3 py-1.5 border border-slate-300 rounded-md text-sm text-slate-800 bg-white"
                        >
                          <option value="">-- Source Term --</option>
                          {detailSession.terms.map(t => (
                            <option key={t.id} value={t.id}>{t.term}</option>
                          ))}
                        </select>

                        <input
                          type="text"
                          placeholder="Relation (e.g. LEADS_TO)"
                          value={relationType}
                          onChange={(e) => setRelationType(e.target.value)}
                          className="px-3 py-1.5 border border-slate-300 rounded-md text-sm text-slate-800 w-36"
                        />

                        <select
                          required
                          value={targetTermId}
                          onChange={(e) => setTargetTermId(e.target.value)}
                          className="px-3 py-1.5 border border-slate-300 rounded-md text-sm text-slate-800 bg-white"
                        >
                          <option value="">-- Target Term --</option>
                          {detailSession.terms.map(t => (
                            <option key={t.id} value={t.id}>{t.term}</option>
                          ))}
                        </select>

                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition"
                        >
                          Link Concepts
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Linked Documents */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <FileText size={20} className="text-emerald-600" />
                      Documents ({detailSession.documents?.length || 0})
                    </h3>
                    {detailSession.documents && detailSession.documents.length > 0 ? (
                      <div className="space-y-2">
                        {detailSession.documents.map((doc) => (
                          <div key={doc.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                            <span className="font-medium text-slate-800">{doc.title}</span>
                            <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded">{doc.fileType || 'TEXT'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No documents linked.</p>
                    )}
                  </div>

                  {/* Screenshots & Audios */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <ImageIcon size={20} className="text-amber-600" />
                        Screenshots ({detailSession.screenshots?.length || 0})
                      </h3>
                      {detailSession.screenshots && detailSession.screenshots.length > 0 ? (
                        <div className="space-y-2">
                          {detailSession.screenshots.map((s) => (
                            <div key={s.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                              <p className="font-medium truncate">{s.filename}</p>
                              {s.windowTitle && <p className="text-slate-400">Window: {s.windowTitle}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">No screenshots linked.</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Headphones size={20} className="text-purple-600" />
                        Audio Records ({detailSession.audioRecords?.length || 0})
                      </h3>
                      {detailSession.audioRecords && detailSession.audioRecords.length > 0 ? (
                        <div className="space-y-2">
                          {detailSession.audioRecords.map((a) => (
                            <div key={a.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                              <p className="font-medium truncate">{a.filename}</p>
                              {a.duration && <p className="text-slate-400">Duration: {a.duration.toFixed(1)}s</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">No audio records linked.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
