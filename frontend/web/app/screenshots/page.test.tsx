import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ScreenshotsPage from './page';
import { api, getApiBaseUrl } from '@/lib/api';

jest.mock('@/lib/api');

const mockedApi = api as unknown as {
  get: jest.Mock;
  post: jest.Mock;
  delete: jest.Mock;
};
const mockedGetApiBaseUrl = getApiBaseUrl as jest.Mock;

const shot = {
  filename: 'shot-1.png',
  url: '/media/screenshots/shot-1.png',
  size: 2048,
  createdAt: '2026-01-01T12:00:00Z',
  windowTitle: 'VS Code',
  extractedText: 'hello world',
};

describe('ScreenshotsPage', () => {
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

  it('fetches and renders the screenshot list on mount', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { files: [shot] } });

    render(<ScreenshotsPage />);

    expect(await screen.findByText('shot-1.png')).toBeInTheDocument();
    expect(mockedApi.get).toHaveBeenCalledWith('/media/screenshots');
    expect(screen.getByText('VS Code')).toBeInTheDocument();

    const img = screen.getByAltText('shot-1.png') as HTMLImageElement;
    expect(img.src).toBe('http://localhost:3000/media/screenshots/shot-1.png');
  });

  it('renders an empty state when there are no screenshots', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { files: [] } });

    render(<ScreenshotsPage />);

    expect(await screen.findByText('No screenshots yet')).toBeInTheDocument();
  });

  it('filters the rendered list by the search query', async () => {
    const other = { ...shot, filename: 'other.png', windowTitle: 'Chrome', extractedText: 'goodbye' };
    mockedApi.get.mockResolvedValueOnce({ data: { files: [shot, other] } });

    render(<ScreenshotsPage />);
    await screen.findByText('shot-1.png');
    expect(screen.getByText('other.png')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Search screenshots/i), { target: { value: 'hello' } });

    expect(screen.getByText('shot-1.png')).toBeInTheDocument();
    expect(screen.queryByText('other.png')).not.toBeInTheDocument();
  });

  it('deletes a screenshot and removes it from the list', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { files: [shot] } });
    mockedApi.delete.mockResolvedValueOnce({ data: { message: 'ok' } });

    render(<ScreenshotsPage />);
    await screen.findByText('shot-1.png');

    fireEvent.click(screen.getByTitle('Delete'));

    await waitFor(() => expect(mockedApi.delete).toHaveBeenCalledWith('/media/screenshots/shot-1.png'));
    expect(screen.queryByText('shot-1.png')).not.toBeInTheDocument();
  });

  it('opens the metadata modal with OCR text when a card is clicked', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { files: [shot] } });

    render(<ScreenshotsPage />);
    await screen.findByText('shot-1.png');

    fireEvent.click(screen.getByText('shot-1.png'));

    expect(await screen.findByText('Details')).toBeInTheDocument();
    expect(screen.getByText('hello world')).toBeInTheDocument();
  });
});
