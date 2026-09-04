'use client';

import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { MessageSquare, BookOpen, Mic, X, Clipboard } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function RightPanel() {
  const { isRightPanelOpen, activeRightPanelTab, setRightPanelTab, toggleRightPanel } = useAppStore();
  const [streamData, setStreamData] = useState<string>('');
  const streamContainerRef = useRef<HTMLDivElement>(null);
  
  const [panelWidth, setPanelWidth] = useState(320);
  const isResizing = useRef(false);

  const startResizing = (e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResizing);
  };

  const resize = (e: MouseEvent) => {
    if (isResizing.current) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < 800) {
        setPanelWidth(newWidth);
      }
    }
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResizing);
  };

  useEffect(() => {
    if (streamContainerRef.current) {
      streamContainerRef.current.scrollTop = streamContainerRef.current.scrollHeight;
    }
  }, [streamData]);

  useEffect(() => {
    // Connect to SSE endpoint instead of WebSocket for frontend events
    const eventSource = new EventSource('http://localhost:3000/api/stream');

    eventSource.onopen = () => {
      console.log('[Clipboard] Connected to backend SSE');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const textPayload = typeof data.payload === 'string' ? data.payload : (data.payload?.text || '');
        
        if (data.type === 'ai_stream_chunk' || data.type === 'ai_response' || data.type === 'stream') {
          setStreamData(prev => prev + textPayload);
        } else if (data.type === 'clipboard_stream') {
          setStreamData(prev => prev + data.payload);
        } else if (data.type === 'screen_result' || data.type === 'sound_result' || data.type === 'text_result') {
          setStreamData(prev => prev + '\n[' + data.type + ']: ' + textPayload + '\n');
        }
      } catch (e) {
        if (typeof event.data === 'string') {
          setStreamData(prev => prev + event.data);
        }
      }
    };

    eventSource.onerror = (error) => {
      console.error('[Clipboard] SSE Error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const clearClipboard = () => setStreamData('');

  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'ai', content: '' }]);

    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg })
      });
      
      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setChatMessages(prev => {
            const newMsgs = [...prev];
            const lastMsg = { ...newMsgs[newMsgs.length - 1] };
            lastMsg.content += chunk;
            newMsgs[newMsgs.length - 1] = lastMsg;
            return newMsgs;
          });
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  if (!isRightPanelOpen) return null;

  return (
    <aside 
      style={{ width: `${panelWidth}px` }}
      className="relative bg-white border-l border-slate-200 flex flex-col h-screen shadow-sm z-10 shrink-0"
    >
      <div 
        onMouseDown={startResizing}
        className="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-400 z-20"
      />
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

      <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
        {activeRightPanelTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-sm text-slate-600 text-center mt-4">
                  <p>How can I help you with your reading today?</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg p-3 text-sm prose prose-sm max-w-none ${
                      msg.role === 'user' ? 'bg-blue-600 text-white prose-invert' : 'bg-white border border-slate-200 text-slate-700'
                    }`}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-200 bg-white flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..." 
                className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700">
                Send
              </button>
            </form>
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

      {/* Clipboard section for AI Stream */}
      <div className="border-t border-slate-200 bg-white p-3 flex flex-col h-1/3 min-h-[150px]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm text-slate-700 flex items-center gap-1">
            <Clipboard size={16} /> Clipboard
          </h3>
          <button onClick={clearClipboard} className="text-xs text-blue-500 hover:text-blue-600">Clear</button>
        </div>
        <div 
          ref={streamContainerRef}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-md p-2 text-sm text-slate-600 overflow-y-auto font-mono whitespace-pre-wrap"
        >
          {streamData ? (
            streamData
          ) : (
            <span className="text-slate-400 italic">Waiting for AI processing stream...</span>
          )}
        </div>
      </div>
    </aside>
  );
}
