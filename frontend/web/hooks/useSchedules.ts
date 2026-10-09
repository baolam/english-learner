'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  widgets?: string;
  startTime: string;
  endTime: string;
}

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/api/schedules');
      setSchedules(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching schedules';
      setError(message);
      console.error('useSchedules fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const updateSchedule = async (id: string, data: Partial<Schedule>) => {
    const res = await api.put(`/api/schedules/${id}`, data);
    await fetchSchedules();
    return res.data;
  };

  return {
    schedules,
    isLoading,
    error,
    refetch: fetchSchedules,
    updateSchedule,
  };
}
