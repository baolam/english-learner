import request from 'supertest';
import { createTestApp } from './helpers/app';
import { prisma } from '../src/utils/prisma';

const app = createTestApp();

describe('Input webhook API (hotkey simulation)', () => {
  const screenshotFilenames: string[] = [];
  const audioFilenames: string[] = [];

  afterAll(async () => {
    if (screenshotFilenames.length > 0) {
      await prisma.screenshot.deleteMany({ where: { filename: { in: screenshotFilenames } } });
    }
    if (audioFilenames.length > 0) {
      await prisma.audioRecord.deleteMany({ where: { filename: { in: audioFilenames } } });
    }
    await prisma.$disconnect();
  });

  it('POST /input/screen with no file returns 400', async () => {
    const res = await request(app).post('/input/screen');
    expect(res.status).toBe(400);
  });

  it('POST /input/screen with a file queues an OCR task and returns a task_id', async () => {
    const res = await request(app)
      .post('/input/screen')
      .attach('file', Buffer.from('fake-screenshot-bytes'), 'hotkey-shot.png');

    expect(res.status).toBe(200);
    expect(res.body.task_id).toBeDefined();
    screenshotFilenames.push(res.body.task_id);

    const row = await prisma.screenshot.findUnique({ where: { filename: res.body.task_id } });
    expect(row).not.toBeNull();
  });

  it('POST /input/sound with a file and text returns the transcribed text', async () => {
    const res = await request(app)
      .post('/input/sound')
      .field('text', 'hello world')
      .attach('file', Buffer.from('fake-audio-bytes'), 'hotkey-sound.wav');

    expect(res.status).toBe(200);
    expect(res.body.text).toBe('hello world');

    const rows = await prisma.audioRecord.findMany({ where: { extractedText: 'hello world' } });
    expect(rows.length).toBeGreaterThanOrEqual(1);
    rows.forEach((r) => audioFilenames.push(r.filename));
  });

  it('POST /input/sound with no file returns 400', async () => {
    const res = await request(app).post('/input/sound').field('text', 'no file attached');
    expect(res.status).toBe(400);
  });

  it('POST /input/text reads the uploaded file buffer as the text content', async () => {
    const res = await request(app)
      .post('/input/text')
      .attach('file', Buffer.from('Academic English snippet via Ctrl+Q'), 'snippet.txt');

    expect(res.status).toBe(200);
    expect(res.body.text).toBe('Academic English snippet via Ctrl+Q');
  });

  it('POST /input/text with no file returns 400', async () => {
    const res = await request(app).post('/input/text');
    expect(res.status).toBe(400);
  });

  // Note: input.schema.ts's soundUploadSchema only validates `text` as an
  // optional string. Multipart form fields are always transmitted/parsed as
  // strings by multer, so there is no practical multipart payload that fails
  // this Zod schema's type check - skipping a dedicated validation-failure
  // case here as instructed.
});
