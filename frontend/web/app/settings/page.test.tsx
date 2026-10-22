import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from './page';
import { api } from '@/lib/api';
import { toast } from 'sonner';

jest.mock('@/lib/api');
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}));

const DEFAULT_SLOGAN =
  '🔥 QUYẾT TÂM!!!!! • Có tiền ít thì từ thiện ít, nhiều thì từ thiện nhiều nha!!! • Học cái hiểu biết nhiều để biết ơn • Lấy tham thiền làm niềm vui • English learner! (chuẩn bị về các cơ chế management và cách thu âm) • Bản vẽ • PHẢI OBSERVATION NHIỀU HƠN NỮA!!!!! • PHẢI BIẾT LƯỢNG SỨC MÌNH!!!';

const mockedApi = api as unknown as { get: jest.Mock; put: jest.Mock };

async function waitForLoaded() {
  await waitFor(() => expect(screen.queryByText(/Đang tải cài đặt hệ thống/i)).not.toBeInTheDocument());
}

describe('SettingsPage', () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
    mockedApi.put.mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.warning as jest.Mock).mockReset();
    localStorage.clear();
  });

  it('loads settings fetched from the backend into the form', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: {
        marqueeText: 'Hello from backend',
        marqueeEnabled: true,
        marqueeSpeed: 2.0,
        marqueeDirection: 'right',
        ankiConnectUrl: 'http://127.0.0.1:9999',
        defaultDeckName: 'My Deck',
        obsidianVaultPath: 'C:/Vault',
      },
    });

    render(<SettingsPage />);
    await waitForLoaded();

    expect(screen.getByDisplayValue('Hello from backend')).toBeInTheDocument();
    expect(screen.getByDisplayValue('http://127.0.0.1:9999')).toBeInTheDocument();
    expect(screen.getByDisplayValue('My Deck')).toBeInTheDocument();
    expect(screen.getByDisplayValue('C:/Vault')).toBeInTheDocument();
  });

  it('falls back to cached localStorage values when the backend fetch fails', async () => {
    localStorage.setItem('marquee_text', 'Cached offline slogan');
    mockedApi.get.mockRejectedValueOnce(new Error('network down'));

    render(<SettingsPage />);
    await waitForLoaded();

    expect(screen.getByDisplayValue('Cached offline slogan')).toBeInTheDocument();
  });

  it('saves changes: edits marquee text, PUTs the payload, and shows success toast', async () => {
    const user = userEvent.setup();
    mockedApi.get.mockResolvedValueOnce({ data: {} });
    mockedApi.put.mockResolvedValueOnce({ data: {} });

    render(<SettingsPage />);
    await waitForLoaded();

    const textarea = screen.getByPlaceholderText('Nhập nội dung slogan hoặc câu nhắc nhở...');
    await user.clear(textarea);
    await user.type(textarea, 'My new slogan');

    await user.click(screen.getByText('Lưu cài đặt'));

    await waitFor(() => expect(mockedApi.put).toHaveBeenCalledTimes(1));
    expect(mockedApi.put).toHaveBeenCalledWith(
      '/api/settings',
      expect.objectContaining({ marqueeText: 'My new slogan' })
    );
    expect(toast.success).toHaveBeenCalled();
    expect(localStorage.getItem('marquee_text')).toBe('My new slogan');
  });

  it('shows a warning toast and local error message when saving fails', async () => {
    const user = userEvent.setup();
    mockedApi.get.mockResolvedValueOnce({ data: {} });
    mockedApi.put.mockRejectedValueOnce(new Error('backend unreachable'));

    render(<SettingsPage />);
    await waitForLoaded();

    await user.click(screen.getByText('Lưu cài đặt'));

    await waitFor(() => expect(toast.warning).toHaveBeenCalled());
    expect(
      screen.getByText('Không thể kết nối đến server backend. Đã lưu cài đặt tạm thời trên trình duyệt.')
    ).toBeInTheDocument();
  });

  it('restores the default slogan when "Khôi phục mặc định" is clicked', async () => {
    const user = userEvent.setup();
    mockedApi.get.mockResolvedValueOnce({ data: {} });

    render(<SettingsPage />);
    await waitForLoaded();

    const textarea = screen.getByPlaceholderText('Nhập nội dung slogan hoặc câu nhắc nhở...');
    await user.clear(textarea);
    await user.type(textarea, 'something custom');
    expect(screen.getByDisplayValue('something custom')).toBeInTheDocument();

    await user.click(screen.getByText('Khôi phục mặc định'));

    expect(screen.getByDisplayValue(DEFAULT_SLOGAN)).toBeInTheDocument();
  });
});
