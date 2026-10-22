import { renderHook, waitFor, act } from '@testing-library/react';
import { useSchedules } from './useSchedules';
import { api } from '@/lib/api';

jest.mock('@/lib/api');

const mockedApi = api as unknown as {
  get: jest.Mock;
  put: jest.Mock;
};

describe('useSchedules', () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
    mockedApi.put.mockReset();
  });

  it('fetches schedules on mount and exposes them', async () => {
    const fakeSchedules = [{ id: '1', title: 'Study', startTime: '2026-01-01T00:00:00Z', endTime: '2026-01-01T01:00:00Z' }];
    mockedApi.get.mockResolvedValueOnce({ data: fakeSchedules });

    const { result } = renderHook(() => useSchedules());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedApi.get).toHaveBeenCalledWith('/api/schedules');
    expect(result.current.schedules).toEqual(fakeSchedules);
    expect(result.current.error).toBeNull();
  });

  it('sets an error message when the fetch fails', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('network down'));

    const { result } = renderHook(() => useSchedules());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('network down');
    expect(result.current.schedules).toEqual([]);
  });

  it('updateSchedule calls PUT then refetches the list', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });
    const { result } = renderHook(() => useSchedules());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updated = { id: '1', title: 'Renamed', startTime: 'a', endTime: 'b' };
    mockedApi.put.mockResolvedValueOnce({ data: updated });
    mockedApi.get.mockResolvedValueOnce({ data: [updated] });

    await act(async () => {
      await result.current.updateSchedule('1', { title: 'Renamed' });
    });

    expect(mockedApi.put).toHaveBeenCalledWith('/api/schedules/1', { title: 'Renamed' });
    expect(mockedApi.get).toHaveBeenCalledTimes(2);
    expect(result.current.schedules).toEqual([updated]);
  });
});
