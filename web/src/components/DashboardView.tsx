import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookCopy, Clock, Zap, Activity } from 'lucide-react';
import { API_BASE } from '../config';

export function DashboardView() {
  const [data, setData] = useState<{decks: string[], newCards: any[], dueCards: any[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${API_BASE}/anki/dashboard`);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Activity className="w-10 h-10 text-blue-500 animate-spin mb-4" />
      <div className="text-gray-500 font-medium">Syncing with Anki...</div>
    </div>
  );

  if (!data) return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center shadow-sm">
      <h3 className="font-bold text-lg mb-2">Connection Error</h3>
      <p>Could not load Anki data. Please ensure Anki is open and AnkiConnect is running on port 8765.</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Progress</h2>
        <p className="text-gray-500 mt-1">Here is what you need to review today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">New Words</p>
              <h3 className="text-4xl font-bold text-blue-600">{data.newCards.length}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 flex items-center">
             <span className="text-blue-500 font-medium mr-1">Ready to learn</span> in your decks.
          </div>
        </div>

        <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">To Review</p>
              <h3 className="text-4xl font-bold text-emerald-600">{data.dueCards.length}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 flex items-center">
             <span className="text-emerald-500 font-medium mr-1">Due today</span> keep your streak alive!
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* New Cards List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <BookCopy className="w-5 h-5 mr-2 text-blue-500" />
              New Vocabulary
            </h3>
            <span className="bg-blue-100 text-blue-700 py-1 px-2.5 rounded-full text-xs font-semibold">
              {data.newCards.length}
            </span>
          </div>
          <div className="p-2 overflow-y-auto flex-1 overflow-x-hidden">
            {data.newCards.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p>No new cards to learn!</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {data.newCards.map(c => (
                  <li key={c.id} onClick={() => setSelectedCard(c)} className="p-3 hover:bg-gray-50 rounded-xl transition-colors flex justify-between items-center group cursor-pointer">
                    <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors truncate pr-2">{c.front}</span>
                    <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-md text-gray-500 font-medium shrink-0">{c.deckName}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Due Cards List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-emerald-500" />
              Due Reviews
            </h3>
            <span className="bg-emerald-100 text-emerald-700 py-1 px-2.5 rounded-full text-xs font-semibold">
              {data.dueCards.length}
            </span>
          </div>
          <div className="p-2 overflow-y-auto flex-1 overflow-x-hidden">
            {data.dueCards.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p>You are all caught up!</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {data.dueCards.map(c => (
                  <li key={c.id} onClick={() => setSelectedCard(c)} className="p-3 hover:bg-gray-50 rounded-xl transition-colors flex justify-between items-center group cursor-pointer">
                    <span className="font-medium text-gray-700 group-hover:text-emerald-600 transition-colors truncate pr-2">{c.front}</span>
                    <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-md text-gray-500 font-medium shrink-0">{c.deckName}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900 truncate pr-4">{selectedCard.deckName}</h3>
              <button onClick={() => setSelectedCard(null)} className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-full hover:bg-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-8 overflow-y-auto w-full bg-gray-50 flex justify-center">
              <div className="card-container bg-white rounded-xl shadow-sm border border-gray-200 w-full overflow-hidden"
                   style={{ minHeight: '300px' }}>
                <div className="card w-full h-full p-8"
                     dangerouslySetInnerHTML={{ 
                       __html: (selectedCard.answer || selectedCard.back || '')
                         .replace(/src=['"]([^'"]+)['"]/g, `src="${API_BASE}/anki/media/$1"`)
                         .replace(/\[anki:play:[a-z0-9:]+\]/g, '')
                         .replace(/\[\[type:[^\]]+\]\]/g, '') 
                     }} />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setSelectedCard(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
