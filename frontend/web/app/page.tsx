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
  const [ankiProgress, setAnkiProgress] = useState({ newCards: 12, reviewCards: 45 });
  const { isRightPanelOpen, toggleRightPanel } = useAppStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const todosRes = await axios.get('http://localhost:3000/api/todos');
        const mappedTodos = todosRes.data.map((t: any) => ({
          id: t.id,
          title: t.title,
          completed: t.isCompleted
        }));
        setTodos(mappedTodos);
      } catch (error) {
        console.error('Error fetching todos:', error);
      }

      try {
        const schedulesRes = await axios.get('http://localhost:3000/api/schedules');
        const mappedSchedules = schedulesRes.data.map((s: any) => {
          const start = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const end = new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            id: s.id,
            title: s.title,
            time: `${start} - ${end}`
          };
        });
        setSchedules(mappedSchedules);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
      
      try {
        // Fetch Anki progress for a default deck, e.g. "Default"
        const learnRes = await axios.get('http://localhost:3000/anki/learn?deck=Default');
        const reviewRes = await axios.get('http://localhost:3000/anki/review?deck=Default');
        setAnkiProgress({
          newCards: learnRes.data.data ? learnRes.data.data.length : 0,
          reviewCards: reviewRes.data.data ? reviewRes.data.data.length : 0
        });
      } catch (error) {
        console.error('Error fetching Anki progress:', error);
      }
    };
    
    fetchData();
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
            <span className="font-semibold text-blue-600">{ankiProgress.newCards}</span>
          </div>
          <div className="flex justify-between mb-6">
            <span className="text-slate-600">Review</span>
            <span className="font-semibold text-orange-500">{ankiProgress.reviewCards}</span>
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
