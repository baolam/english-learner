import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AudiosPage from './page';
import { api, getApiBaseUrl } from '@/lib/api';

jest.mock('@/lib/api');

const mockedApi = api as unknown as {
  get: jest.Mock;
  post: jest.Mock;
  delete: jest.Mock;
};
const mockedGetApiBaseUrl = getApiBaseUrl as jest.Mock;

const audio = {
  filename: 'rec-1.webm',
  url: '/media/audio/rec-1.webm',
  size: 4096,
  createdAt: '2026-01-01T12:00:00Z',
  duration: 12.3,
  extractedText: 'this is a transcript',
};

describe('AudiosPage', () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
    mockedApi.delete.mockReset();
    mockedGetApiBaseUrl.mockReturnValue('http://localhost:3000');
    jest.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches and renders the audio recording list on mount', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { files: [audio] } });

    render(<AudiosPage />);

    expect(await screen.findByText('rec-1.webm')).toBeInTheDocument();
    expect(mockedApi.get).toHaveBeenCalledWith('/media/audio');
    expect(screen.getByText(/Duration: 12.3s/)).toBeInTheDocument();
  });

  it('renders an empty state when there are no audio recordings', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { files: [] } });

    render(<AudiosPage />);

    expect(await screen.findByText('No audios found')).toBeInTheDocument();
  });

  it('deletes an audio recording and removes it from the list', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { files: [audio] } });
    mockedApi.delete.mockResolvedValueOnce({ data: { message: 'ok' } });

    render(<AudiosPage />);
    await screen.findByText('rec-1.webm');

    fireEvent.click(screen.getByTitle('Delete'));

    await waitFor(() => expect(mockedApi.delete).toHaveBeenCalledWith('/media/audio/rec-1.webm'));
    expect(screen.queryByText('rec-1.webm')).not.toBeInTheDocument();
  });

  it('builds the <audio> player src from getApiBaseUrl() once the detail modal is open', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { files: [audio] } });

    render(<AudiosPage />);
    await screen.findByText('rec-1.webm');

    fireEvent.click(screen.getByText('rec-1.webm'));

    const player = await screen.findByText('Audio Details').then(() =>
      document.querySelector('audio')
    );
    expect(player).not.toBeNull();
    expect(player!.getAttribute('src')).toBe('http://localhost:3000/media/audio/rec-1.webm');
    expect(screen.getByText('this is a transcript')).toBeInTheDocument();
  });
});
