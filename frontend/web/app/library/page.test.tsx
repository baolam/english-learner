import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LibraryPage from './page';
import { api } from '@/lib/api';

jest.mock('@/lib/api');

const mockedApi = api as unknown as {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
};

const baseDoc = {
  id: 'd1',
  title: 'English Grammar in Use',
  author: 'Raymond Murphy',
  publishedYear: 2019,
  fileType: 'PDF',
  status: 'READING',
  tags: [{ id: 'tag1', name: 'grammar' }],
  updatedAt: '2026-01-01T00:00:00Z',
};

function mockFetchResponses(docs: any[] = [baseDoc], sessions: any[] = []) {
  mockedApi.get.mockImplementation((url: string) => {
    if (url === '/api/documents') {
      return Promise.resolve({ data: { data: docs } });
    }
    if (url.startsWith('/api/study-sessions')) {
      return Promise.resolve({ data: { data: sessions } });
    }
    return Promise.resolve({ data: { data: [] } });
  });
}

describe('LibraryPage', () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
    mockedApi.put.mockReset();
    mockedApi.delete.mockReset();
  });

  it('fetches documents and study sessions on mount and renders the document', async () => {
    mockFetchResponses();
    render(<LibraryPage />);

    await waitFor(() => expect(screen.getByText('English Grammar in Use')).toBeInTheDocument());

    expect(mockedApi.get).toHaveBeenCalledWith('/api/documents', { params: {} });
    expect(mockedApi.get).toHaveBeenCalledWith('/api/study-sessions?limit=100');
    expect(screen.getByText(/By Raymond Murphy/)).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
  });

  it('shows the empty-library state when there are no documents', async () => {
    mockFetchResponses([]);
    render(<LibraryPage />);
    await waitFor(() => expect(screen.getByText('Your library is empty')).toBeInTheDocument());
  });

  it('refetches with a status query param when the filter changes', async () => {
    mockFetchResponses();
    render(<LibraryPage />);
    await waitFor(() => expect(screen.getByText('English Grammar in Use')).toBeInTheDocument());

    const statusSelect = screen.getByDisplayValue('Status: All');
    await userEvent.selectOptions(statusSelect, 'READING');

    await waitFor(() =>
      expect(mockedApi.get).toHaveBeenCalledWith('/api/documents', { params: { status: 'READING' } })
    );
  });

  it('refetches with a search query param when typing in the search box', async () => {
    mockFetchResponses();
    render(<LibraryPage />);
    await waitFor(() => expect(screen.getByText('English Grammar in Use')).toBeInTheDocument());

    const searchBox = screen.getByPlaceholderText('Search documents by title, author, or tags...');
    await userEvent.type(searchBox, 'grammar');

    await waitFor(() =>
      expect(mockedApi.get).toHaveBeenCalledWith('/api/documents', { params: { search: 'grammar' } })
    );
  });

  it('creates a new document via the Add Material modal', async () => {
    mockFetchResponses();
    mockedApi.post.mockResolvedValueOnce({ data: { ...baseDoc, id: 'd2' } });
    render(<LibraryPage />);
    await waitFor(() => expect(screen.getByText('English Grammar in Use')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /Add Material/ }));
    const titleInput = screen.getByPlaceholderText('e.g. English Grammar in Use');
    expect(titleInput).toBeInTheDocument();

    await userEvent.type(titleInput, 'New Book');
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(mockedApi.post).toHaveBeenCalledWith(
        '/api/documents',
        expect.objectContaining({ title: 'New Book', status: 'UNREAD', fileType: 'TEXT' })
      )
    );
  });

  it('opens the edit modal pre-filled with the document data and saves via PUT', async () => {
    mockFetchResponses();
    mockedApi.put.mockResolvedValueOnce({ data: baseDoc });
    render(<LibraryPage />);
    await waitFor(() => expect(screen.getByText('English Grammar in Use')).toBeInTheDocument());

    await userEvent.click(screen.getByTitle('Edit'));

    const modalHeading = screen.getByText('Edit Material');
    expect(modalHeading).toBeInTheDocument();
    expect(screen.getByDisplayValue('English Grammar in Use')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Raymond Murphy')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() =>
      expect(mockedApi.put).toHaveBeenCalledWith(
        '/api/documents/d1',
        expect.objectContaining({ title: 'English Grammar in Use' })
      )
    );
  });

  it('deletes a document after confirming', async () => {
    mockFetchResponses();
    mockedApi.delete.mockResolvedValueOnce({ data: {} });
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    render(<LibraryPage />);
    await waitFor(() => expect(screen.getByText('English Grammar in Use')).toBeInTheDocument());

    await userEvent.click(screen.getByTitle('Delete'));

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => expect(mockedApi.delete).toHaveBeenCalledWith('/api/documents/d1'));

    confirmSpy.mockRestore();
  });

  it('does not delete when the confirm dialog is cancelled', async () => {
    mockFetchResponses();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    render(<LibraryPage />);
    await waitFor(() => expect(screen.getByText('English Grammar in Use')).toBeInTheDocument());

    await userEvent.click(screen.getByTitle('Delete'));

    expect(mockedApi.delete).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('renders distinct status badges for UNREAD, READING, and COMPLETED', async () => {
    mockFetchResponses([
      { ...baseDoc, id: 'd1', status: 'UNREAD' },
      { ...baseDoc, id: 'd2', status: 'READING' },
      { ...baseDoc, id: 'd3', status: 'COMPLETED' },
    ]);
    render(<LibraryPage />);

    await waitFor(() => expect(screen.getByText('Unread')).toBeInTheDocument());
    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
