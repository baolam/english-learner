import { renderHook, waitFor, act } from '@testing-library/react';
import { useTodos } from './useTodos';
import { api } from '@/lib/api';

jest.mock('@/lib/api');

const mockedApi = api as unknown as {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
};

describe('useTodos', () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
    mockedApi.put.mockReset();
    mockedApi.delete.mockReset();
  });

  it('fetches todos on mount and exposes them', async () => {
    const fakeTodos = [{ id: '1', title: 'Read chapter 1', isCompleted: false, createdAt: '2026-01-01' }];
    mockedApi.get.mockResolvedValueOnce({ data: fakeTodos });

    const { result } = renderHook(() => useTodos());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedApi.get).toHaveBeenCalledWith('/api/todos');
    expect(result.current.todos).toEqual(fakeTodos);
    expect(result.current.error).toBeNull();
  });

  it('sets an error message when the fetch fails', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('network down'));

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('network down');
    expect(result.current.todos).toEqual([]);
  });

  it('createTodo posts then refetches and returns the created todo', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const created = { id: '2', title: 'New todo', isCompleted: false, createdAt: 'now' };
    mockedApi.post.mockResolvedValueOnce({ data: created });
    mockedApi.get.mockResolvedValueOnce({ data: [created] });

    let returned: unknown;
    await act(async () => {
      returned = await result.current.createTodo({ title: 'New todo' });
    });

    expect(mockedApi.post).toHaveBeenCalledWith('/api/todos', { title: 'New todo' });
    expect(mockedApi.get).toHaveBeenCalledTimes(2);
    expect(returned).toEqual(created);
    expect(result.current.todos).toEqual([created]);
  });

  it('updateTodo puts then refetches', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updated = { id: '1', title: 'Renamed', isCompleted: false, createdAt: 'now' };
    mockedApi.put.mockResolvedValueOnce({ data: updated });
    mockedApi.get.mockResolvedValueOnce({ data: [updated] });

    await act(async () => {
      await result.current.updateTodo('1', { title: 'Renamed' });
    });

    expect(mockedApi.put).toHaveBeenCalledWith('/api/todos/1', { title: 'Renamed' });
    expect(mockedApi.get).toHaveBeenCalledTimes(2);
    expect(result.current.todos).toEqual([updated]);
  });

  it('deleteTodo deletes then refetches', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: '1', title: 'x', isCompleted: false, createdAt: 'now' }] });
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockedApi.delete.mockResolvedValueOnce({ data: {} });
    mockedApi.get.mockResolvedValueOnce({ data: [] });

    await act(async () => {
      await result.current.deleteTodo('1');
    });

    expect(mockedApi.delete).toHaveBeenCalledWith('/api/todos/1');
    expect(mockedApi.get).toHaveBeenCalledTimes(2);
    expect(result.current.todos).toEqual([]);
  });

  it('toggleTodo flips isCompleted via updateTodo', async () => {
    const todo = { id: '1', title: 'x', isCompleted: false, createdAt: 'now' };
    mockedApi.get.mockResolvedValueOnce({ data: [todo] });
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockedApi.put.mockResolvedValueOnce({ data: { ...todo, isCompleted: true } });
    mockedApi.get.mockResolvedValueOnce({ data: [{ ...todo, isCompleted: true }] });

    await act(async () => {
      await result.current.toggleTodo(todo);
    });

    expect(mockedApi.put).toHaveBeenCalledWith('/api/todos/1', { isCompleted: true });
  });
});
