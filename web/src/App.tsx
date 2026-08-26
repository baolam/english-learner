import React, { useState } from 'react';
import { BookOpen, PenTool, LayoutDashboard } from 'lucide-react';
import './App.css';
import { DashboardView } from './components/DashboardView';
import { ReadingView } from './components/ReadingView';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="text-blue-600 w-8 h-8" />
              <span className="font-bold text-xl text-gray-900">LingoAnki</span>
            </div>
            <div className="flex space-x-8">
              <button onClick={() => setActiveTab('dashboard')} className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'dashboard' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
              </button>
              <button onClick={() => setActiveTab('reading')} className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'reading' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <BookOpen className="w-4 h-4 mr-2" /> Reading
              </button>
              <button onClick={() => setActiveTab('writing')} className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'writing' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <PenTool className="w-4 h-4 mr-2" /> Writing
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'reading' && <ReadingView />}
        {activeTab === 'writing' && <div className="text-center text-gray-500 mt-10">Writing Feature Coming Soon...</div>}
      </main>
    </div>
  );
}

export default App;
