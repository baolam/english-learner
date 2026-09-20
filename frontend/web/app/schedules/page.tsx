'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, dateFnsLocalizer, Event as RbcEvent, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Link from 'next/link';
import { Calendar as CalendarIcon, Plus, X, Target, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import './custom-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Schedule {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  widgets?: string;
  startTime: string;
  endTime: string;
}

interface Todo {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  scheduleId?: string;
  createdAt: string;
}

interface CalendarEvent extends RbcEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  type: 'schedule' | 'todo';
}

export default function SchedulesPage() {
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: '', description: '', scheduleId: '' });
  
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  const fetchData = async () => {
    try {
      const [schedRes, todoRes] = await Promise.all([
        axios.get('http://localhost:3000/api/schedules'),
        axios.get('http://localhost:3000/api/todos')
      ]);
      
      const fetchedSchedules: Schedule[] = schedRes.data;
      const fetchedTodos: Todo[] = todoRes.data;
      
      setSchedules(fetchedSchedules);
      setAllTodos(fetchedTodos);

      const mappedEvents: CalendarEvent[] = [];

      // 1. Add Schedules (Long-term Events)
      fetchedSchedules.forEach(s => {
        mappedEvents.push({
          id: s.id,
          title: `🎯 ${s.title}`,
          start: new Date(s.startTime),
          end: new Date(s.endTime),
          allDay: true, // Often long-term goals are better viewed as all-day spans
          type: 'schedule'
        });
      });

      // 2. Add Todos (Daily Tasks)
      fetchedTodos.forEach(t => {
        // Bỏ qua các task Thường nhật khỏi lịch
        if (t.title.includes('[Thường nhật]')) {
          return;
        }

        // Show daily todos on the calendar.
        const createdAtDate = new Date(t.createdAt);
        mappedEvents.push({
          id: t.id,
          title: `${t.isCompleted ? '✅' : '⬜'} ${t.title}`,
          start: createdAtDate,
          end: createdAtDate,
          allDay: true,
          type: 'todo'
        });
      });

      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTodo = async () => {
    if (!newTodo.title.trim()) return;
    try {
      await axios.post('http://localhost:3000/api/todos', {
        title: newTodo.title,
        description: newTodo.description,
        scheduleId: newTodo.scheduleId || undefined
      });
      setIsModalOpen(false);
      setNewTodo({ title: '', description: '', scheduleId: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  const toggleTodoCompletion = async (todo: Todo) => {
    try {
      await axios.put(`http://localhost:3000/api/todos/${todo.id}`, {
        isCompleted: !todo.isCompleted
      });
      fetchData();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const getScheduleProgress = (scheduleId: string) => {
    const relatedTodos = allTodos.filter(t => t.scheduleId === scheduleId);
    if (relatedTodos.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = relatedTodos.filter(t => t.isCompleted).length;
    return {
      completed,
      total: relatedTodos.length,
      percentage: Math.round((completed / relatedTodos.length) * 100)
    };
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 min-h-screen relative flex flex-col">
      <div className="flex justify-between items-center mb-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            Schedules & Todos
          </h1>
          <p className="text-slate-500 mt-1">Manage your long-term goals and daily tasks.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
        >
          <Plus size={20} />
          Create Daily Todo
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-w-0">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '70vh', minHeight: '600px' }}
            views={['month', 'week', 'day', 'agenda']}
            view={view as View}
            onView={(newView) => setView(newView)}
            date={date}
            onNavigate={(newDate) => setDate(newDate)}
            className="custom-calendar"
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.type === 'todo' ? '#10b981' : '#3b82f6',
                borderColor: 'transparent',
                opacity: (event.type === 'todo' && event.title.includes('✅')) ? 0.6 : 1
              }
            })}
          />
        </div>

        {/* Long-term Goals Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Target size={18} className="text-blue-600" />
              Long-term Goals (Events)
            </h2>
            <p className="text-sm text-slate-500">Track your overall progress</p>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4" style={{ maxHeight: '70vh' }}>
            {schedules.map(schedule => {
              const progress = getScheduleProgress(schedule.id);
              return (
                <div 
                  key={schedule.id} 
                  onClick={() => setSelectedSchedule(schedule)}
                  className="p-4 bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-300 hover:shadow-sm transition cursor-pointer group"
                >
                  <h3 className="font-medium text-slate-800 text-sm mb-2 group-hover:text-blue-600 transition-colors">{schedule.title}</h3>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                      <span>Progress</span>
                      <span>{progress.percentage}% ({progress.completed}/{progress.total})</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {schedules.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-4">No events found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Detail Schedule */}
      {selectedSchedule && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-800 pr-4">{selectedSchedule.title}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(selectedSchedule.startTime).toLocaleDateString()} - {new Date(selectedSchedule.endTime).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => setSelectedSchedule(null)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              {selectedSchedule.description && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                  <div className="text-slate-700 text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {selectedSchedule.description}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Target size={14} /> Daily Tasks (Todos)
                </h3>
                <div className="space-y-2">
                  {allTodos.filter(t => t.scheduleId === selectedSchedule.id).map(todo => (
                    <div key={todo.id} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg bg-white shadow-sm">
                      <button onClick={() => toggleTodoCompletion(todo)} className="mt-0.5 focus:outline-none">
                        {todo.isCompleted ? (
                          <CheckCircle2 size={18} className="text-green-500" />
                        ) : (
                          <Circle size={18} className="text-slate-300 hover:text-slate-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <span className={`text-sm font-medium ${todo.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {todo.title}
                        </span>
                        {todo.description && (
                          <p className={`text-xs mt-1 ${todo.isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                            {todo.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {allTodos.filter(t => t.scheduleId === selectedSchedule.id).length === 0 && (
                    <p className="text-sm text-slate-500 italic">No daily tasks linked to this goal yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <Link 
                href={`/schedules/${selectedSchedule.id}`}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition text-sm shadow-sm"
              >
                <ExternalLink size={16} />
                Mở trang tùy biến tự do (Notion Style)
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create Todo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-800">Create Daily Todo</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Todo Title *</label>
                <input 
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                  placeholder="What needs to be done today?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                  placeholder="Any extra details..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link to Goal / Event (Optional)</label>
                <select 
                  value={newTodo.scheduleId}
                  onChange={(e) => setNewTodo({...newTodo, scheduleId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">-- Free Todo --</option>
                  {schedules.map(schedule => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Connecting to a goal will track your progress.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateTodo}
                disabled={!newTodo.title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
