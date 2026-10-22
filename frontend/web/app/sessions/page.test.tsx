import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudySessionsPage from './page';
import { api } from '@/lib/api';

jest.mock('@/lib/api');
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() } }));

const mockedApi = api as unknown as {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
};

const baseSession = {
  id: 's1',
  title: 'English Grammar',
  category: 'ENGLISH',
  status: 'ACTIVE',
  startedAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  _count: { documents: 1, terms: 2, screenshots: 0, audioRecords: 0 },
};

describe('StudySessionsPage', () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
    mockedApi.put.mockReset();
    mockedApi.delete.mockReset();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the session list from the paginated API response', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: [baseSession] } });

    render(<StudySessionsPage />);

    await waitFor(() => expect(screen.getByText('English Grammar')).toBeInTheDocument());
    expect(mockedApi.get).toHaveBeenCalledWith('/api/study-sessions', { params: {} });
  });

  it('shows the empty state when there are no sessions', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: [] } });

    render(<StudySessionsPage />);

    await waitFor(() => expect(screen.getByText('No study sessions found')).toBeInTheDocument());
  });

  it('does not crash and still renders the empty state when the fetch fails', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('network down'));

    render(<StudySessionsPage />);

    await waitFor(() => expect(screen.getByText('No study sessions found')).toBeInTheDocument());
  });

  it('clicking a session card fetches and shows its detail', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: [baseSession] } });
    render(<StudySessionsPage />);
    await waitFor(() => expect(screen.getByText('English Grammar')).toBeInTheDocument());

    const detail = {
      ...baseSession,
      terms: [{ id: 't1', term: 'ubiquitous' }, { id: 't2', term: 'ephemeral' }],
      conceptRelations: [],
      documents: [],
      screenshots: [],
      audioRecords: [],
    };
    mockedApi.get.mockResolvedValueOnce({ data: detail });

    await userEvent.click(screen.getByText('English Grammar'));

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledWith('/api/study-sessions/s1'));
    await waitFor(() => expect(screen.getByText('Terms & Concepts (2)')).toBeInTheDocument());
    expect(screen.getAllByText('ubiquitous').length).toBeGreaterThan(0);
  });

  it('creating a new session submits the form via POST', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: [] } });
    render(<StudySessionsPage />);
    await waitFor(() => expect(screen.getByText('No study sessions found')).toBeInTheDocument());

    await userEvent.click(screen.getByText('New Session'));
    const titleInput = screen.getByPlaceholderText('e.g. English Grammar & Daily Conversation');
    await userEvent.type(titleInput, 'New Vocab Session');

    mockedApi.post.mockResolvedValueOnce({ data: { ...baseSession, id: 's2', title: 'New Vocab Session' } });
    mockedApi.get.mockResolvedValueOnce({ data: { data: [] } });

    await userEvent.click(screen.getByText('Create Session'));

    await waitFor(() =>
      expect(mockedApi.post).toHaveBeenCalledWith(
        '/api/study-sessions',
        expect.objectContaining({ title: 'New Vocab Session', category: 'ENGLISH', status: 'ACTIVE' })
      )
    );
  });

  it('deleting a session confirms then calls DELETE', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: [baseSession] } });
    render(<StudySessionsPage />);
    await waitFor(() => expect(screen.getByText('English Grammar')).toBeInTheDocument());

    mockedApi.delete.mockResolvedValueOnce({});
    mockedApi.get.mockResolvedValueOnce({ data: { data: [] } });

    await userEvent.click(screen.getByTitle('Delete'));

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(mockedApi.delete).toHaveBeenCalledWith('/api/study-sessions/s1'));
  });

  it('adding a concept relation posts sourceTermId/targetTermId/relationType', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: [baseSession] } });
    render(<StudySessionsPage />);
    await waitFor(() => expect(screen.getByText('English Grammar')).toBeInTheDocument());

    const detail = {
      ...baseSession,
      terms: [{ id: 't1', term: 'ubiquitous' }, { id: 't2', term: 'ephemeral' }],
      conceptRelations: [],
      documents: [],
      screenshots: [],
      audioRecords: [],
    };
    mockedApi.get.mockResolvedValueOnce({ data: detail });
    await userEvent.click(screen.getByText('English Grammar'));
    await waitFor(() => expect(screen.getByText('Link Concepts')).toBeInTheDocument());

    const sourceSelect = screen.getByDisplayValue('-- Source Term --');
    const targetSelect = screen.getByDisplayValue('-- Target Term --');
    await userEvent.selectOptions(sourceSelect, 't1');
    await userEvent.selectOptions(targetSelect, 't2');

    mockedApi.post.mockResolvedValueOnce({ data: { id: 'r1' } });
    mockedApi.get.mockResolvedValueOnce({ data: detail });

    await userEvent.click(screen.getByText('Link Concepts'));

    await waitFor(() =>
      expect(mockedApi.post).toHaveBeenCalledWith('/api/study-sessions/s1/relations', {
        sourceTermId: 't1',
        targetTermId: 't2',
        relationType: 'RELATED_TO',
      })
    );
  });
});
