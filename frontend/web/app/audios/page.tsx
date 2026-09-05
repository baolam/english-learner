'use client';

import { Headphones, Upload, Search, Filter, PlayCircle, Mic, Trash2, ExternalLink, X, Info } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface AudioRecord {
  filename: string;
  url: string;
  size?: number;
  createdAt?: string;
  modifiedAt?: string;
  extractedText?: string;
}

export default function AudiosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [audios, setAudios] = useState<AudioRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAudios = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:3000/media/audio');
      setAudios(res.data.files || []);
    } catch (error) {
      console.error('Error fetching audios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudios();
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
      await axios.post('http://localhost:3000/media/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchAudios();
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Failed to upload audio. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (filename: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Are you sure you want to delete this audio?')) return;
    
    try {
      await axios.delete(`http://localhost:3000/media/audio/${filename}`);
      setAudios(prev => prev.filter(a => a.filename !== filename));
      if (selectedAudio?.filename === filename) {
        setSelectedAudio(null);
      }
    } catch (error) {
      console.error('Error deleting audio:', error);
      alert('Failed to delete audio.');
    }
  };

  const filteredAudios = audios.filter(a => 
    a.filename.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Headphones className="w-8 h-8 text-blue-600" />
            Audios
          </h1>
          <p className="text-slate-500 mt-1">Manage your recordings and listening materials.</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition font-medium shadow-sm"
          >
            <Mic size={20} className="text-red-500" />
            Record
          </button>
          
          <input 
            type="file" 
            accept="audio/*"
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
            {isUploading ? 'Uploading...' : 'Upload Audio'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search audios..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition">
          <Filter size={20} />
          Filter
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAudios.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <Headphones size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-600">
              {searchQuery ? 'No audios match your search' : 'No audios found'}
            </p>
            {!searchQuery && <p className="text-sm mt-1">Upload or record an audio to get started.</p>}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAudios.map((audio) => (
            <div 
              key={audio.filename} 
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedAudio(audio)}
            >
              <div className="h-32 bg-slate-100 flex items-center justify-center relative">
                <PlayCircle size={48} className="text-blue-500 opacity-70 group-hover:opacity-100 transition" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
                  <a 
                    href={`http://localhost:3000${audio.url}`} 
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white/20 text-white rounded-full hover:bg-white/40 transition"
                    title="Play Full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={20} />
                  </a>
                  <button 
                    onClick={(e) => handleDelete(audio.filename, e)}
                    className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="p-3 border-t border-slate-100">
                <p className="text-sm font-medium text-slate-700 truncate" title={audio.filename}>
                  {audio.filename}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-slate-400">{formatBytes(audio.size)}</span>
                  <span className="text-xs text-slate-400">{formatDate(audio.createdAt).split(' ')[1]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metadata Modal */}
      {selectedAudio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8" onClick={() => setSelectedAudio(null)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Info size={20} className="text-blue-600" />
                Audio Details
              </h2>
              <button onClick={() => setSelectedAudio(null)} className="text-slate-400 hover:text-slate-600 transition p-1 rounded-md hover:bg-slate-100">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-6 flex justify-center">
                <audio 
                  controls 
                  src={`http://localhost:3000${selectedAudio.url}`}
                  className="w-full max-w-md"
                  autoPlay
                />
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Filename</h3>
                  <p className="text-slate-800 break-all bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {selectedAudio.filename}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">File Size</h3>
                    <p className="text-slate-800">{formatBytes(selectedAudio.size)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Type</h3>
                    <p className="text-slate-800 uppercase">{selectedAudio.filename.split('.').pop() || 'Unknown'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Created At</h3>
                    <p className="text-slate-800">{formatDate(selectedAudio.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Last Modified</h3>
                    <p className="text-slate-800">{formatDate(selectedAudio.modifiedAt)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Direct URL</h3>
                  <div className="flex gap-2 mt-1">
                    <input 
                      type="text" 
                      readOnly 
                      value={`http://localhost:3000${selectedAudio.url}`}
                      className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-md px-3 py-2 outline-none"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`http://localhost:3000${selectedAudio.url}`);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-md transition text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {selectedAudio.extractedText && (
                  <div className="pt-2">
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Transcribed Text (STT)</h3>
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-3 max-h-48 overflow-y-auto">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {selectedAudio.extractedText}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={(e) => handleDelete(selectedAudio.filename, e as unknown as React.MouseEvent)}
                className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition font-medium flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
