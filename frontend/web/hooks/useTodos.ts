'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  scheduleId?: string;
  createdAt: string;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/api/todos');
      setTodos(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching todos';
      setError(message);
      console.error('useTodos fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const createTodo = async (data: { title: string; description?: string; scheduleId?: string }) => {
    const res = await api.post('/api/todos', data);
    await fetchTodos();
    return res.data;
  };

  const updateTodo = async (id: string, data: Partial<Todo>) => {
    const res = await api.put(`/api/todos/${id}`, data);
    await fetchTodos();
    return res.data;
  };

  const deleteTodo = async (id: string) => {
    await api.delete(`/api/todos/${id}`);
    await fetchTodos();
  };

  const toggleTodo = async (todo: Todo) => {
    return updateTodo(todo.id, { isCompleted: !todo.isCompleted });
  };

  return {
    todos,
    isLoading,
    error,
    refetch: fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
  };
}
