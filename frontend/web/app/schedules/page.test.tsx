import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SchedulesPage from './page';
import { api } from '@/lib/api';

jest.mock('@/lib/api');
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() } }));

jest.mock('react-big-calendar', () => ({
  Calendar: ({ events }: any) => (
    <div data-testid="mock-calendar">
      {events?.map((e: any) => (
        <div key={e.id} data-testid="calendar-event">
          {e.title}
        </div>
      ))}
    </div>
  ),
  dateFnsLocalizer: jest.fn(() => ({})),
}));

const mockedApi = api as unknown as {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
};

const schedule = {
  id: 'sched-1',
  title: 'Finish English course',
  startTime: '2026-01-01T00:00:00Z',
  endTime: '2026-02-01T00:00:00Z',
};

const todo = {
  id: 'todo-1',
  title: 'Review chapter 1',
  isCompleted: false,
  scheduleId: 'sched-1',
  createdAt: '2026-01-05T00:00:00Z',
};

function mockFetchData(schedules: any[] = [], todos: any[] = []) {
  mockedApi.get.mockImplementation((url: string) => {
    if (url === '/api/schedules') return Promise.resolve({ data: schedules });
    if (url === '/api/todos') return Promise.resolve({ data: todos });
    return Promise.resolve({ data: [] });
  });
}

describe('SchedulesPage', () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
    mockedApi.put.mockReset();
  });

  it('fetches schedules and todos, mapping them into calendar events', async () => {
    mockFetchData([schedule], [todo]);

    render(<SchedulesPage />);

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledWith('/api/schedules'));
    expect(mockedApi.get).toHaveBeenCalledWith('/api/todos');

    const events = await screen.findAllByTestId('calendar-event');
    expect(events.some((el) => el.textContent?.includes('Finish English course'))).toBe(true);
    expect(events.some((el) => el.textContent?.includes('Review chapter 1'))).toBe(true);
    expect(screen.getByRole('heading', { level: 3, name: 'Finish English course' })).toBeInTheDocument();
  });

  it('renders an empty state when there are no goals', async () => {
    mockFetchData([], []);

    render(<SchedulesPage />);

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled());
    expect(await screen.findByText('No events found.')).toBeInTheDocument();
  });

  it('creates a daily todo via the modal and refetches data', async () => {
    mockFetchData([schedule], []);

    render(<SchedulesPage />);
    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledWith('/api/todos'));

    fireEvent.click(screen.getByText('Create Daily Todo'));

    const titleInput = screen.getByPlaceholderText('What needs to be done today?');
    fireEvent.change(titleInput, { target: { value: 'New daily task' } });

    mockedApi.post.mockResolvedValueOnce({ data: { ...todo, id: 'todo-2', title: 'New daily task' } });

    fireEvent.click(screen.getByText('Create Todo'));

    await waitFor(() =>
      expect(mockedApi.post).toHaveBeenCalledWith('/api/todos', {
        title: 'New daily task',
        description: '',
        scheduleId: undefined,
      })
    );
    // fetchData is called again after creation (initial mount + after create)
    await waitFor(() => expect(mockedApi.get.mock.calls.filter((c) => c[0] === '/api/schedules').length).toBe(2));
  });

  it('opens a schedule detail modal and toggles a linked todo', async () => {
    mockFetchData([schedule], [todo]);

    render(<SchedulesPage />);
    const goalHeading = await screen.findByRole('heading', { level: 3, name: 'Finish English course' });

    fireEvent.click(goalHeading);

    expect(await screen.findByText('Review chapter 1')).toBeInTheDocument();

    mockedApi.put.mockResolvedValueOnce({ data: { ...todo, isCompleted: true } });

    fireEvent.click(screen.getByText('Review chapter 1').closest('div')!.parentElement!.querySelector('button')!);

    await waitFor(() =>
      expect(mockedApi.put).toHaveBeenCalledWith('/api/todos/todo-1', { isCompleted: true })
    );
  });
});
