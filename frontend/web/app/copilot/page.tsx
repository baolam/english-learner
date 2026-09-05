'use client';

import { useEffect, useState, useRef } from 'react';
import { MessageSquare, BookOpen, Mic, Clipboard, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function CopilotPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'vocabulary' | 'speaking'>('chat');
  const [streamData, setStreamData] = useState<string>('');
  const streamContainerRef = useRef<HTMLDivElement>(null);
  
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // SSE Stream Effect
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/api/stream');

    eventSource.onopen = () => console.log('[Copilot] Connected to backend SSE');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const textPayload = typeof data.payload === 'string' ? data.payload : (data.payload?.text || '');
        
        if (data.type === 'clipboard_stream') {
          setStreamData(prev => prev + data.payload);
        } else if (data.type === 'screen_result' || data.type === 'sound_result' || data.type === 'text_result') {
          setStreamData(prev => prev + '\n[' + data.type + ']: ' + textPayload + '\n');
        }
      } catch {
        if (typeof event.data === 'string') {
          setStreamData(prev => prev + event.data);
        }
      }
    };

    eventSource.onerror = (error) => console.error('[Copilot] SSE Error:', error);

    return () => eventSource.close();
  }, []);

  useEffect(() => {
    if (streamContainerRef.current) {
      streamContainerRef.current.scrollTop = streamContainerRef.current.scrollHeight;
    }
  }, [streamData]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const clearClipboard = () => setStreamData('');

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

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-blue-600" />
          AI Copilot
        </h1>
        <p className="text-slate-500 mt-2">Your intelligent assistant for research, language, and tasks.</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 bg-white">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 border-b-2 transition ${
                activeTab === 'chat' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <MessageSquare size={18} /> Chat
            </button>
            <button
              onClick={() => setActiveTab('vocabulary')}
              className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 border-b-2 transition ${
                activeTab === 'vocabulary' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <BookOpen size={18} /> Vocabulary
            </button>
            <button
              onClick={() => setActiveTab('speaking')}
              className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 border-b-2 transition ${
                activeTab === 'speaking' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Mic size={18} /> Speaking
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <Sparkles size={48} className="text-blue-200 mb-4" />
                      <p className="text-lg font-medium text-slate-600">How can I help you today?</p>
                      <p className="text-sm mt-2 text-center max-w-md">Ask me anything about your reading, schedules, or just chat!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 text-[15px] leading-relaxed shadow-sm prose prose-sm max-w-none ${
                          msg.role === 'user' ? 'bg-blue-600 text-white prose-invert rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                        }`}>
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 bg-white border-t border-slate-200">
                  <form onSubmit={handleSendChat} className="max-w-4xl mx-auto relative flex items-center">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask AI Copilot..." 
                      className="w-full border border-slate-300 rounded-full pl-6 pr-24 py-3 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                    <button 
                      type="submit" 
                      disabled={!chatInput.trim()}
                      className="absolute right-2 bg-blue-600 text-white px-5 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            {activeTab === 'vocabulary' && (
              <div className="flex-1 flex items-center justify-center text-slate-500 p-8 text-center">
                <div>
                  <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-lg font-medium text-slate-600">Vocabulary Manager</p>
                  <p className="text-sm mt-2">No new vocabulary selected. Highlight text in the library to add them here.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'speaking' && (
              <div className="flex-1 flex items-center justify-center text-slate-500 p-8 text-center">
                <div>
                  <button className="bg-blue-100 text-blue-600 p-8 rounded-full hover:bg-blue-200 transition shadow-sm mb-6 relative group">
                    <div className="absolute inset-0 bg-blue-400 rounded-full opacity-0 group-hover:animate-ping"></div>
                    <Mic size={48} className="relative z-10" />
                  </button>
                  <p className="text-lg font-medium text-slate-600">Tap to practice speaking</p>
                  <p className="text-sm mt-2 max-w-sm mx-auto">AI will evaluate your pronunciation and fluency.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clipboard Section (Right Pane) */}
        <div className="w-1/3 min-w-[300px] max-w-[500px] flex flex-col bg-slate-100">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <Clipboard size={18} className="text-slate-500" /> 
              Stream Clipboard
            </h3>
            <button 
              onClick={clearClipboard} 
              className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md transition"
            >
              Clear
            </button>
          </div>
          <div 
            ref={streamContainerRef}
            className="flex-1 p-4 text-sm text-slate-700 overflow-y-auto font-mono whitespace-pre-wrap selection:bg-blue-200"
          >
            {streamData ? (
              streamData
            ) : (
              <div className="text-slate-400 italic flex flex-col items-center justify-center h-full text-center space-y-3">
                <Clipboard size={32} className="text-slate-300" />
                <p>Waiting for AI processing stream...</p>
                <p className="text-xs max-w-[200px]">Data from background tasks and clipboard will appear here in real-time.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
