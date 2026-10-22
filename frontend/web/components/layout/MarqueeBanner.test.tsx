import { render, screen, waitFor, act } from '@testing-library/react';
import { MarqueeBanner } from './MarqueeBanner';
import { api } from '@/lib/api';

jest.mock('@/lib/api');

const mockedApi = api as unknown as { get: jest.Mock };

describe('MarqueeBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedApi.get.mockReset();
  });

  it('renders the default slogan while settings are loading', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: {} });

    render(<MarqueeBanner />);

    expect(screen.getAllByText(/QUYẾT TÂM/).length).toBeGreaterThan(0);

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledWith('/api/settings'));
  });

  it('applies marqueeText/enabled/speed/direction from the backend response and caches them in localStorage', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: {
        marqueeText: 'Custom slogan from backend',
        marqueeEnabled: true,
        marqueeSpeed: 2.5,
        marqueeDirection: 'right',
      },
    });

    render(<MarqueeBanner />);

    await waitFor(() => expect(screen.getAllByText('Custom slogan from backend').length).toBeGreaterThan(0));

    expect(localStorage.getItem('marquee_text')).toBe('Custom slogan from backend');
    expect(localStorage.getItem('marquee_enabled')).toBe('true');
    expect(localStorage.getItem('marquee_speed')).toBe('2.5');
    expect(localStorage.getItem('marquee_direction')).toBe('right');
  });

  it('renders nothing when marqueeEnabled is false', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { marqueeEnabled: false } });

    const { container } = render(<MarqueeBanner />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('reacts to a marquee-updated custom window event without refetching', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: {} });

    render(<MarqueeBanner />);
    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledTimes(1));

    act(() => {
      window.dispatchEvent(
        new CustomEvent('marquee-updated', {
          detail: { marqueeText: 'Updated live', marqueeEnabled: true, marqueeSpeed: 1, marqueeDirection: 'left' },
        })
      );
    });

    await waitFor(() => expect(screen.getAllByText('Updated live').length).toBeGreaterThan(0));
    // The custom event carries a full detail payload, so it should not trigger another fetch.
    expect(mockedApi.get).toHaveBeenCalledTimes(1);
  });

  it('falls back to loadSettings (refetch) when a marquee-updated event has no detail', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: {} }).mockResolvedValueOnce({ data: { marqueeText: 'Reloaded' } });

    render(<MarqueeBanner />);
    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledTimes(1));

    act(() => {
      window.dispatchEvent(new CustomEvent('marquee-updated'));
    });

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getAllByText('Reloaded').length).toBeGreaterThan(0));
  });
});
