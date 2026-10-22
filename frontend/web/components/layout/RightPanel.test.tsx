import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RightPanel } from './RightPanel';
import { useAppStore } from '@/store/appStore';

jest.mock('@/lib/api', () => ({
  getApiBaseUrl: jest.fn(() => 'http://localhost:3000'),
}));

// react-markdown v10 is ESM-only and pulls in a deep ESM-only
// unified/remark dependency chain that Jest can't transform out of the
// box; the component only needs the raw text rendered for these tests.
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  closed = false;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
  }
}

function makeStreamingFetchResponse(chunks: string[]) {
  let index = 0;
  return {
    body: {
      getReader() {
        return {
          read: async () => {
            if (index < chunks.length) {
              const value = new TextEncoder().encode(chunks[index]);
              index += 1;
              return { done: false, value };
            }
            return { done: true, value: undefined };
          },
        };
      },
    },
  };
}

describe('RightPanel', () => {
  beforeEach(() => {
    useAppStore.setState({ isRightPanelOpen: true, activeRightPanelTab: 'chat' });
    MockEventSource.instances = [];
    (global as unknown as { EventSource: typeof MockEventSource }).EventSource = MockEventSource;
    global.fetch = jest.fn();
  });

  it('renders nothing when the panel is closed', () => {
    useAppStore.setState({ isRightPanelOpen: false });
    const { container } = render(<RightPanel />);
    expect(container).toBeEmptyDOMElement();
  });

  it('opens an SSE connection to /api/stream on mount and closes it on unmount', () => {
    const { unmount } = render(<RightPanel />);

    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toBe('http://localhost:3000/api/stream');

    unmount();
    expect(MockEventSource.instances[0].closed).toBe(true);
  });

  it('appends incoming screen_result SSE messages to the clipboard panel', async () => {
    render(<RightPanel />);
    const source = MockEventSource.instances[0];

    act(() => {
      source.onmessage?.({ data: JSON.stringify({ type: 'screen_result', payload: { text: 'captured text' } }) });
    });

    expect(await screen.findByText(/captured text/)).toBeInTheDocument();
  });

  it('shows the chat tab by default and switches to vocabulary on click', async () => {
    const user = userEvent.setup();
    render(<RightPanel />);

    expect(screen.getByText('How can I help you with your reading today?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Vocab/i }));

    expect(screen.getByText('No new vocabulary selected.')).toBeInTheDocument();
    expect(useAppStore.getState().activeRightPanelTab).toBe('vocabulary');
  });

  it('clicking the close button calls toggleRightPanel', async () => {
    const user = userEvent.setup();
    render(<RightPanel />);

    const closeButton = screen.getAllByRole('button')[0];
    await user.click(closeButton);

    expect(useAppStore.getState().isRightPanelOpen).toBe(false);
  });

  it('sends a chat message and streams the assistant reply', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(makeStreamingFetchResponse(['Hello', ' there']));

    const user = userEvent.setup();
    render(<RightPanel />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Hi assistant');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/chat',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ prompt: 'Hi assistant' }),
      })
    );

    expect(await screen.findByText('Hi assistant')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Hello there')).toBeInTheDocument());
  });
});
