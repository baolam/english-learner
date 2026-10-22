import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CopilotPage from './page';
// Note: TextEncoder/TextDecoder (needed by the component's streaming-chat
// reader) are polyfilled globally in jest.setup.js.

jest.mock('@/lib/api', () => ({
  api: { get: jest.fn(), post: jest.fn() },
  getApiBaseUrl: () => 'http://localhost:3000',
}));

// react-markdown v10 ships ESM-only; stub it to avoid fighting Jest's CJS
// transform for a dependency whose actual markdown rendering isn't under test.
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => children,
}));

class MockEventSource {
  static instances: MockEventSource[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onerror: ((ev: unknown) => void) | null = null;
  close = jest.fn();
  constructor(public url: string) {
    MockEventSource.instances.push(this);
  }
}

function mockStreamingFetch(chunks: string[]) {
  const encoder = new TextEncoder();
  let i = 0;
  return jest.fn().mockResolvedValue({
    body: {
      getReader: () => ({
        read: async () => {
          if (i < chunks.length) {
            const value = encoder.encode(chunks[i]);
            i += 1;
            return { done: false, value };
          }
          return { done: true, value: undefined };
        },
      }),
    },
  });
}

describe('CopilotPage', () => {
  beforeEach(() => {
    MockEventSource.instances = [];
    (global as any).EventSource = MockEventSource;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).fetch;
  });

  it('opens an SSE connection to /api/stream on mount', () => {
    render(<CopilotPage />);
    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toBe('http://localhost:3000/api/stream');
  });

  it('closes the EventSource on unmount', () => {
    const { unmount } = render(<CopilotPage />);
    const instance = MockEventSource.instances[0];
    unmount();
    expect(instance.close).toHaveBeenCalled();
  });

  it('appends a screen_result SSE message to the clipboard stream', async () => {
    render(<CopilotPage />);
    const instance = MockEventSource.instances[0];

    act(() => {
      instance.onmessage?.({ data: JSON.stringify({ type: 'screen_result', payload: { text: 'hello from OCR' } }) });
    });

    await waitFor(() => expect(screen.getByText(/screen_result/)).toBeInTheDocument());
    expect(screen.getByText(/hello from OCR/)).toBeInTheDocument();
  });

  it('appends a clipboard_stream SSE message verbatim', async () => {
    render(<CopilotPage />);
    const instance = MockEventSource.instances[0];

    act(() => {
      instance.onmessage?.({ data: JSON.stringify({ type: 'clipboard_stream', payload: 'raw clipboard text' }) });
    });

    await waitFor(() => expect(screen.getByText('raw clipboard text')).toBeInTheDocument());
  });

  it('clears the clipboard stream when Clear is clicked', async () => {
    render(<CopilotPage />);
    const instance = MockEventSource.instances[0];

    act(() => {
      instance.onmessage?.({ data: JSON.stringify({ type: 'clipboard_stream', payload: 'raw clipboard text' }) });
    });
    await waitFor(() => expect(screen.getByText('raw clipboard text')).toBeInTheDocument());

    await userEvent.click(screen.getByText('Clear'));

    expect(screen.queryByText('raw clipboard text')).not.toBeInTheDocument();
    expect(screen.getByText('Waiting for AI processing stream...')).toBeInTheDocument();
  });

  it('sends a chat message via streaming fetch and renders the streamed reply', async () => {
    (global as any).fetch = mockStreamingFetch(['Hello', ' world']);
    render(<CopilotPage />);

    const input = screen.getByPlaceholderText('Ask AI Copilot...');
    await userEvent.type(input, 'Hi there');
    await userEvent.click(screen.getByText('Send'));

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/chat',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Hi there' }),
      })
    );

    expect(await screen.findByText('Hi there')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Hello world')).toBeInTheDocument());
  });

  it('switches to the Vocabulary and Speaking placeholder tabs', async () => {
    render(<CopilotPage />);

    await userEvent.click(screen.getByText('Vocabulary'));
    expect(screen.getByText('Vocabulary Manager')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Speaking'));
    expect(screen.getByText('Tap to practice speaking')).toBeInTheDocument();
  });
});
