import request from 'supertest';
import axios from 'axios';
import { createTestApp } from './helpers/app';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const app = createTestApp();

describe('Anki API (axios to AnkiConnect mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /anki/decks returns deck names wrapped in {success, data}', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { result: ['Default', 'English Learner'] } });

    const res = await request(app).get('/anki/decks');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: ['Default', 'English Learner'] });
  });

  it('GET /anki/word-status without word query param returns 400', async () => {
    const res = await request(app).get('/anki/word-status');
    expect(res.status).toBe(400);
  });

  it('GET /anki/word-status with word returns status (findCards then cardsInfo)', async () => {
    mockedAxios.post
      .mockResolvedValueOnce({ data: { result: [123] } })
      .mockResolvedValueOnce({ data: { result: [{ cardId: 123 }] } });

    const res = await request(app).get('/anki/word-status?word=ubiquitous');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: [{ cardId: 123 }] });
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });

  it('GET /anki/learn without deck query param returns 400', async () => {
    const res = await request(app).get('/anki/learn');
    expect(res.status).toBe(400);
  });

  it('GET /anki/review without deck query param returns 400', async () => {
    const res = await request(app).get('/anki/review');
    expect(res.status).toBe(400);
  });

  it('POST /anki/cards-info with non-array cards returns 400', async () => {
    const res = await request(app).post('/anki/cards-info').send({ cards: 'not-an-array' });
    expect(res.status).toBe(400);
  });

  it('POST /anki/cards-info with a valid array returns card info', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { result: [{ cardId: 1 }] } });

    const res = await request(app).post('/anki/cards-info').send({ cards: [1] });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: [{ cardId: 1 }] });
  });

  it('propagates an AnkiConnect-reported error as a 500', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { error: 'deck not found' } });

    const res = await request(app).get('/anki/decks');

    expect(res.status).toBe(500);
  });
});
