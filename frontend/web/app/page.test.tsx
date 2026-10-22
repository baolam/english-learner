import { render, screen, waitFor } from '@testing-library/react';
import Home from './page';
import { api } from '@/lib/api';

jest.mock('@/lib/api');

const mockedApi = api as unknown as { get: jest.Mock };

function mockApiGet(overrides: Record<string, unknown> = {}) {
  const defaults: Record<string, unknown> = {
    '/api/todos': { data: [] },
    '/api/schedules': { data: [] },
    '/anki/learn?deck=Default': { data: { data: [] } },
    '/anki/review?deck=Default': { data: { data: [] } },
  };
  const responses = { ...defaults, ...overrides };
  mockedApi.get.mockImplementation((url: string) => {
    if (url in responses) {
      const value = responses[url];
      if (value instanceof Error) return Promise.reject(value);
      return Promise.resolve(value);
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });
}

describe('Home (dashboard page)', () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders fetched todos, schedules, and anki progress', async () => {
    mockApiGet({
      '/api/todos': {
        data: [
          { id: 't1', title: 'Read chapter 3', isCompleted: true },
          { id: 't2', title: 'Review flashcards', isCompleted: false },
        ],
      },
      '/api/schedules': {
        data: [{ id: 's1', title: 'English class', startTime: '2026-01-01T09:00:00Z', endTime: '2026-01-01T10:00:00Z' }],
      },
      '/anki/learn?deck=Default': { data: { data: [1, 2, 3] } },
      '/anki/review?deck=Default': { data: { data: [1, 2] } },
    });

    render(<Home />);

    await waitFor(() => expect(screen.getByText('Read chapter 3')).toBeInTheDocument());

    expect(screen.getByText('Review flashcards')).toBeInTheDocument();
    expect(screen.getByText('1/2 Done')).toBeInTheDocument();
    expect(screen.getByText('English class')).toBeInTheDocument();
    expect(screen.getByText('New Cards').closest('div')).toHaveTextContent('3');
    expect(screen.getByText('Review').closest('div')).toHaveTextContent('2');
  });

  it('renders zero/empty state without crashing when lists are empty', async () => {
    mockApiGet();

    render(<Home />);

    await waitFor(() => expect(screen.getByText('0/0 Done')).toBeInTheDocument());

    expect(screen.getByText('New Cards').closest('div')).toHaveTextContent('0');
    expect(screen.getByText('Review').closest('div')).toHaveTextContent('0');
    expect(screen.getByText('Upcoming Schedules')).toBeInTheDocument();
  });

  it('keeps default anki progress and empty lists when all fetches fail', async () => {
    mockApiGet({
      '/api/todos': new Error('todos down'),
      '/api/schedules': new Error('schedules down'),
      '/anki/learn?deck=Default': new Error('anki down'),
      '/anki/review?deck=Default': new Error('anki down'),
    });

    render(<Home />);

    // The anki fetch awaits learn then review sequentially inside one try/catch,
    // so when the first call rejects, the second is never issued: todos + schedules + anki/learn = 3 calls.
    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledTimes(3));

    // Default initial ankiProgress state (newCards: 12, reviewCards: 45) is untouched on failure.
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('0/0 Done')).toBeInTheDocument();
  });
});
