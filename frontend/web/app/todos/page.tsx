'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckSquare, Plus, X, CheckCircle2, Circle, Target } from 'lucide-react';

interface Schedule {
  id: string;
  title: string;
}

interface Todo {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  scheduleId?: string;
  createdAt: string;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: '', description: '', scheduleId: '' });
  
  const [selectedTodoForEdit, setSelectedTodoForEdit] = useState<Todo | null>(null);

  const fetchData = async () => {
    try {
      const [todoRes, schedRes] = await Promise.all([
        axios.get('http://localhost:3000/api/todos'),
        axios.get('http://localhost:3000/api/schedules')
      ]);
      setTodos(todoRes.data);
      setSchedules(schedRes.data);
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

  const handleUpdateTodo = async () => {
    if (!selectedTodoForEdit || !selectedTodoForEdit.title.trim()) return;
    try {
      await axios.put(`http://localhost:3000/api/todos/${selectedTodoForEdit.id}`, {
        title: selectedTodoForEdit.title,
        description: selectedTodoForEdit.description,
        scheduleId: selectedTodoForEdit.scheduleId || undefined
      });
      setSelectedTodoForEdit(null);
      fetchData();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDeleteTodo = async () => {
    if (!selectedTodoForEdit) return;
    try {
      await axios.delete(`http://localhost:3000/api/todos/${selectedTodoForEdit.id}`);
      setSelectedTodoForEdit(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const toggleTodoCompletion = async (todo: Todo) => {
    try {
      await axios.put(`http://localhost:3000/api/todos/${todo.id}`, {
        isCompleted: !todo.isCompleted
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const pendingRoutineTodos = todos.filter(t => !t.isCompleted && t.title.includes('[Thường nhật]'));
  
  const isResearchTask = (title: string) => title.includes('[Thảo luận]') || title.includes('[Nghiên cứu]');
  const pendingResearchTodos = todos.filter(t => !t.isCompleted && isResearchTask(t.title));
  
  const pendingNormalTodos = todos.filter(t => !t.isCompleted && !t.title.includes('[Thường nhật]') && !isResearchTask(t.title));
  
  const completedTodos = todos.filter(t => t.isCompleted);

  const getScheduleName = (scheduleId?: string) => {
    if (!scheduleId) return null;
    const schedule = schedules.find(s => s.id === scheduleId);
    return schedule ? schedule.title : null;
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-blue-600" />
            Todos
          </h1>
          <p className="text-slate-500 mt-1">Manage all your daily tasks directly.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
        >
          <Plus size={20} />
          Create Todo
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Research & Discussion Tasks */}
        {pendingResearchTodos.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              Research & Discussions <span className="bg-purple-100 text-purple-700 py-0.5 px-2 rounded-full text-xs">{pendingResearchTodos.length}</span>
            </h2>
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-purple-100/50">
                {pendingResearchTodos.map(todo => (
                  <div key={todo.id} className="p-5 flex items-start gap-4 hover:bg-white/50 transition cursor-pointer" onClick={() => setSelectedTodoForEdit(todo)}>
                    <button onClick={(e) => { e.stopPropagation(); toggleTodoCompletion(todo); }} className="mt-1 focus:outline-none">
                      <Circle size={22} className="text-purple-300 hover:text-purple-500" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-purple-900 text-lg">{todo.title}</h3>
                      {todo.description && (
                        <p className="text-sm text-purple-700/80 mt-2 whitespace-pre-wrap leading-relaxed border-l-2 border-purple-200 pl-3">{todo.description}</p>
                      )}
                      {todo.scheduleId && (
                        <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-purple-700 bg-purple-100/70 w-fit px-2 py-1 rounded-md">
                          <Target size={12} />
                          Goal: {getScheduleName(todo.scheduleId)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Routine Tasks (Thường nhật) */}
        {pendingRoutineTodos.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              Daily Routines <span className="bg-emerald-100 text-emerald-700 py-0.5 px-2 rounded-full text-xs">{pendingRoutineTodos.length}</span>
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {pendingRoutineTodos.map(todo => (
                  <div key={todo.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition cursor-pointer" onClick={() => setSelectedTodoForEdit(todo)}>
                    <button onClick={(e) => { e.stopPropagation(); toggleTodoCompletion(todo); }} className="mt-1 focus:outline-none">
                      <Circle size={22} className="text-slate-300 hover:text-slate-400" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-800">{todo.title}</h3>
                      {todo.description && (
                        <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap">{todo.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pending Tasks */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            Pending Tasks <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs">{pendingNormalTodos.length}</span>
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {pendingNormalTodos.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No pending tasks. Great job!</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingNormalTodos.map(todo => (
                  <div key={todo.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition cursor-pointer" onClick={() => setSelectedTodoForEdit(todo)}>
                    <button onClick={(e) => { e.stopPropagation(); toggleTodoCompletion(todo); }} className="mt-1 focus:outline-none">
                      <Circle size={22} className="text-slate-300 hover:text-slate-400" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-800">{todo.title}</h3>
                      {todo.description && (
                        <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap">{todo.description}</p>
                      )}
                      {todo.scheduleId && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md">
                          <Target size={12} />
                          Goal: {getScheduleName(todo.scheduleId)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Completed Todos */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2 opacity-70">
            Completed <span className="bg-slate-200 text-slate-700 py-0.5 px-2 rounded-full text-xs">{completedTodos.length}</span>
          </h2>
          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            {completedTodos.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No completed tasks yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {completedTodos.map(todo => (
                  <div key={todo.id} className="p-4 flex items-start gap-4 opacity-70 hover:bg-slate-100 transition cursor-pointer" onClick={() => setSelectedTodoForEdit(todo)}>
                    <button onClick={(e) => { e.stopPropagation(); toggleTodoCompletion(todo); }} className="mt-1 focus:outline-none">
                      <CheckCircle2 size={22} className="text-green-500" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-500 line-through">{todo.title}</h3>
                      {todo.description && (
                        <p className="text-sm text-slate-400 mt-1 whitespace-pre-wrap line-through">{todo.description}</p>
                      )}
                      {todo.scheduleId && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500 bg-slate-200 w-fit px-2 py-1 rounded-md">
                          <Target size={12} />
                          {getScheduleName(todo.scheduleId)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Modal Edit/Detail Todo */}
      {selectedTodoForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-800">Edit Todo</h2>
              <button onClick={() => setSelectedTodoForEdit(null)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Todo Title *</label>
                <input 
                  type="text"
                  value={selectedTodoForEdit.title}
                  onChange={(e) => setSelectedTodoForEdit({...selectedTodoForEdit, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={selectedTodoForEdit.description || ''}
                  onChange={(e) => setSelectedTodoForEdit({...selectedTodoForEdit, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Task Classification</label>
                <div className="flex gap-6 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input 
                      type="radio" 
                      name="editTaskType" 
                      checked={!selectedTodoForEdit.scheduleId} 
                      onChange={() => setSelectedTodoForEdit({...selectedTodoForEdit, scheduleId: ''})} 
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Free Todo (Standalone)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input 
                      type="radio" 
                      name="editTaskType" 
                      checked={!!selectedTodoForEdit.scheduleId} 
                      onChange={() => setSelectedTodoForEdit({...selectedTodoForEdit, scheduleId: schedules[0]?.id || ''})} 
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Goal / Event Sub-task</span>
                  </label>
                </div>

                {!!selectedTodoForEdit.scheduleId && (
                  <div className="pl-6 border-l-2 border-blue-100 ml-2 mt-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Select Parent Goal / Event</label>
                    <select 
                      value={selectedTodoForEdit.scheduleId}
                      onChange={(e) => setSelectedTodoForEdit({...selectedTodoForEdit, scheduleId: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      {schedules.map(schedule => (
                        <option key={schedule.id} value={schedule.id}>
                          {schedule.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-between items-center bg-slate-50">
              <button 
                onClick={handleDeleteTodo}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
              >
                Delete
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedTodoForEdit(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateTodo}
                  disabled={!selectedTodoForEdit.title.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create Todo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-800">Create New Todo</h2>
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
                  placeholder="What needs to be done?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                  placeholder="Any extra details..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Task Classification</label>
                <div className="flex gap-6 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input 
                      type="radio" 
                      name="createTaskType" 
                      checked={!newTodo.scheduleId} 
                      onChange={() => setNewTodo({...newTodo, scheduleId: ''})} 
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Free Todo (Standalone)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input 
                      type="radio" 
                      name="createTaskType" 
                      checked={!!newTodo.scheduleId} 
                      onChange={() => setNewTodo({...newTodo, scheduleId: schedules[0]?.id || ''})} 
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Goal / Event Sub-task</span>
                  </label>
                </div>

                {!!newTodo.scheduleId && (
                  <div className="pl-6 border-l-2 border-blue-100 ml-2 mt-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Select Parent Goal / Event</label>
                    <select 
                      value={newTodo.scheduleId}
                      onChange={(e) => setNewTodo({...newTodo, scheduleId: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      {schedules.map(schedule => (
                        <option key={schedule.id} value={schedule.id}>
                          {schedule.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
