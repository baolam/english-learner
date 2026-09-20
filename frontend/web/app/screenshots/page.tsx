'use client';

import { Image, Upload, Search, Trash2, ExternalLink, X, Info, Monitor, FolderKanban } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Screenshot {
  filename: string;
  url: string;
  size?: number;
  createdAt?: string;
  modifiedAt?: string;
  extractedText?: string;
  windowTitle?: string;
  sessionId?: string;
  studySession?: { id: string; title: string };
}

export default function ScreenshotsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchScreenshots = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:3000/media/screenshots');
      setScreenshots(res.data.files || []);
    } catch (error) {
      console.error('Error fetching screenshots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenshots();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      await axios.post('http://localhost:3000/media/screenshots', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchScreenshots();
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      alert('Failed to upload screenshot. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (filename: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Are you sure you want to delete this screenshot?')) return;

    try {
      await axios.delete(`http://localhost:3000/media/screenshots/${filename}`);
      setScreenshots(prev => prev.filter(s => s.filename !== filename));
      if (selectedScreenshot?.filename === filename) {
        setSelectedScreenshot(null);
      }
    } catch (error) {
      console.error('Error deleting screenshot:', error);
      alert('Failed to delete screenshot.');
    }
  };

  const filteredScreenshots = screenshots.filter(s =>
    s.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.windowTitle && s.windowTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.extractedText && s.extractedText.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Image className="w-8 h-8 text-blue-600" />
            Screenshots
          </h1>
          <p className="text-slate-500 mt-1">Manage and organize your captured learning materials.</p>
        </div>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50"
        >
          <Upload size={20} />
          {isUploading ? 'Uploading...' : 'Upload Screenshot'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search screenshots by filename, window title, or text..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredScreenshots.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
          <Image size={48} className="text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-600">
            {searchQuery ? 'No screenshots match your search' : 'No screenshots yet'}
          </p>
          {!searchQuery && <p className="text-sm mt-1">Upload your first screenshot to get started.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredScreenshots.map((screenshot) => (
            <div
              key={screenshot.filename}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              onClick={() => setSelectedScreenshot(screenshot)}
            >
              <div className="aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center">
                <img
                  src={`http://localhost:3000${screenshot.url}`}
                  alt={screenshot.filename}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/600x400?text=Image+Error';
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <a
                    href={`http://localhost:3000${screenshot.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white/20 text-white rounded-full hover:bg-white/40 transition"
                    title="View Full Size"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={20} />
                  </a>
                  <button
                    onClick={(e) => handleDelete(screenshot.filename, e)}
                    className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="p-3">
                <p className="text-sm font-medium text-slate-700 truncate" title={screenshot.filename}>
                  {screenshot.filename}
                </p>

                {screenshot.windowTitle && (
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-1">
                    <Monitor size={12} className="flex-shrink-0" />
                    {screenshot.windowTitle}
                  </p>
                )}

                {screenshot.studySession && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      <FolderKanban size={10} /> {screenshot.studySession.title}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">{formatBytes(screenshot.size)}</span>
                  <span className="text-xs text-slate-400">{formatDate(screenshot.createdAt).split(' ')[1]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metadata Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8" onClick={() => setSelectedScreenshot(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] h-[85vh] flex flex-col md:flex-row overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Preview (Left Side) */}
            <div className="md:w-2/3 bg-slate-900 flex items-center justify-center overflow-hidden relative min-h-0">
              <img
                src={`http://localhost:3000${selectedScreenshot.url}`}
                alt={selectedScreenshot.filename}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Metadata (Right Side) */}
            <div className="md:w-1/3 flex flex-col h-full min-h-0 bg-white border-l border-slate-100">
              <div className="flex justify-between items-center p-5 border-b border-slate-100 flex-shrink-0">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Info size={20} className="text-blue-600" />
                  Details
                </h2>
                <button onClick={() => setSelectedScreenshot(null)} className="text-slate-400 hover:text-slate-600 transition p-1 rounded-md hover:bg-slate-100">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto min-h-0 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Filename</h3>
                  <p className="text-slate-800 break-all bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                    {selectedScreenshot.filename}
                  </p>
                </div>

                {selectedScreenshot.windowTitle && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Captured Window Title</h3>
                    <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm flex items-center gap-2">
                      <Monitor size={16} className="text-slate-500 flex-shrink-0" />
                      {selectedScreenshot.windowTitle}
                    </p>
                  </div>
                )}

                {selectedScreenshot.studySession && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Linked Study Session</h3>
                    <p className="text-slate-800 bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm flex items-center gap-2 text-blue-900 font-medium">
                      <FolderKanban size={16} className="text-blue-600 flex-shrink-0" />
                      {selectedScreenshot.studySession.title}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">File Size</h3>
                    <p className="text-slate-800 text-sm">{formatBytes(selectedScreenshot.size)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Captured At</h3>
                    <p className="text-slate-800 text-sm">{formatDate(selectedScreenshot.createdAt)}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Extracted Text (OCR)</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3 max-h-48 overflow-y-auto">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedScreenshot.extractedText || 'Chưa có văn bản OCR được trích xuất.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                <a
                  href={`http://localhost:3000${selectedScreenshot.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium flex items-center gap-2 text-sm"
                >
                  <ExternalLink size={18} />
                  Open Full
                </a>
                <button
                  onClick={(e) => handleDelete(selectedScreenshot.filename, e as unknown as React.MouseEvent)}
                  className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition font-medium flex items-center gap-2 text-sm"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
