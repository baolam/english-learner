import request from 'supertest';
import axios from 'axios';
import { createTestApp } from './helpers/app';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const app = createTestApp();

describe('AI proxy routes (axios to the Python AI service mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/model-info proxies the AI service response', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { current_model: '1b' } });

    const res = await request(app).get('/api/model-info');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ current_model: '1b' });
  });

  it('GET /api/model-info returns 502 when the AI service is unreachable', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('connection refused'));

    const res = await request(app).get('/api/model-info');

    expect(res.status).toBe(502);
  });

  it('POST /api/ai/extract-terms proxies the request body and returns the AI response', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { terms: [{ term: 'foo' }] } });

    const res = await request(app).post('/api/ai/extract-terms').send({ text: 'some text' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ terms: [{ term: 'foo' }] });
  });

  it('POST /api/ai/term-explain with fast_first returns the fast result immediately', async () => {
    mockedAxios.post
      .mockResolvedValueOnce({ data: { fast: true } })
      .mockResolvedValueOnce({ data: { fast: false } });

    const res = await request(app)
      .post('/api/ai/term-explain')
      .send({ term: 'foo', fast_first: true });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ fast: true });
  });

  // /api/stream (SSE) and /api/chat (streaming proxy piping aiRes.data into
  // the response) are intentionally not covered here: supertest buffers the
  // full response body rather than exposing a readable stream/event-source
  // interface, so asserting on a kept-open SSE connection or a piped stream
  // isn't practical with this test setup.
});
