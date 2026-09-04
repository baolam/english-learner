'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppStore } from '@/store/appStore';
import { PanelRightOpen } from 'lucide-react';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

interface Schedule {
  id: string;
  title: string;
  time: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const { isRightPanelOpen, toggleRightPanel } = useAppStore();

  useEffect(() => {
    // Tạm thời mock data hoặc gọi API thật nếu backend đang chạy
    setTodos([
      { id: '1', title: 'Đọc xong Chương 2 sách AI', completed: false },
      { id: '2', title: 'Review 50 thẻ Anki môn Toán', completed: true },
    ]);
    
    setSchedules([
      { id: '1', title: 'Đọc paper "Attention is all you need"', time: '19:00 - 21:00' }
    ]);

    // Uncomment when backend is ready
    /*
    axios.get('http://localhost:3000/api/todos').then(res => setTodos(res.data));
    axios.get('http://localhost:3000/api/schedules').then(res => setSchedules(res.data));
    */
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Good Evening!</h1>
          <p className="text-slate-500 mt-1">Here is your learning summary for today.</p>
        </div>
        {!isRightPanelOpen && (
          <button 
            onClick={toggleRightPanel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-700"
          >
            <PanelRightOpen size={18} />
            <span>Open AI Copilot</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Today's Tasks */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center justify-between">
            <span>Today's Tasks</span>
            <span className="text-sm font-normal text-slate-500">{todos.filter(t => t.completed).length}/{todos.length} Done</span>
          </h2>
          <ul className="space-y-3">
            {todos.map(todo => (
              <li key={todo.id} className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={todo.completed} 
                  readOnly
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-slate-700 ${todo.completed ? 'line-through text-slate-400' : ''}`}>
                  {todo.title}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Anki Progress */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Anki Progress</h2>
          <div className="flex justify-between mb-2">
            <span className="text-slate-600">New Cards</span>
            <span className="font-semibold text-blue-600">12</span>
          </div>
          <div className="flex justify-between mb-6">
            <span className="text-slate-600">Review</span>
            <span className="font-semibold text-orange-500">45</span>
          </div>
          <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Start Reviewing
          </button>
        </div>

        {/* Schedules */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-3">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Schedules</h2>
          <div className="space-y-4">
            {schedules.map(schedule => (
              <div key={schedule.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">{schedule.title}</span>
                <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">{schedule.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
