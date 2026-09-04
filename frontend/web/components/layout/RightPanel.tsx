'use client';

import { useAppStore } from '@/store/appStore';
import { MessageSquare, BookOpen, Mic, X } from 'lucide-react';

export function RightPanel() {
  const { isRightPanelOpen, activeRightPanelTab, setRightPanelTab, toggleRightPanel } = useAppStore();

  if (!isRightPanelOpen) return null;

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-screen shadow-sm z-10">
      <div className="flex items-center justify-between p-3 border-b border-slate-200">
        <h2 className="font-semibold text-slate-800">AI Copilot</h2>
        <button onClick={toggleRightPanel} className="p-1 hover:bg-slate-100 rounded-md text-slate-500">
          <X size={18} />
        </button>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setRightPanelTab('chat')}
          className={`flex-1 py-2 text-sm flex justify-center items-center gap-1 border-b-2 ${
            activeRightPanelTab === 'chat' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquare size={16} /> Chat
        </button>
        <button
          onClick={() => setRightPanelTab('vocabulary')}
          className={`flex-1 py-2 text-sm flex justify-center items-center gap-1 border-b-2 ${
            activeRightPanelTab === 'vocabulary' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen size={16} /> Vocab
        </button>
        <button
          onClick={() => setRightPanelTab('speaking')}
          className={`flex-1 py-2 text-sm flex justify-center items-center gap-1 border-b-2 ${
            activeRightPanelTab === 'speaking' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Mic size={16} /> Speak
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
        {activeRightPanelTab === 'chat' && (
          <div className="text-sm text-slate-600">
            <p>How can I help you with your reading today?</p>
          </div>
        )}
        {activeRightPanelTab === 'vocabulary' && (
          <div className="text-sm text-slate-600">
            <p>No new vocabulary selected.</p>
          </div>
        )}
        {activeRightPanelTab === 'speaking' && (
          <div className="text-sm text-slate-600 flex flex-col items-center mt-10">
            <button className="bg-blue-100 text-blue-600 p-4 rounded-full hover:bg-blue-200 transition">
              <Mic size={32} />
            </button>
            <p className="mt-4">Tap to practice speaking</p>
          </div>
        )}
      </div>
    </aside>
  );
}
