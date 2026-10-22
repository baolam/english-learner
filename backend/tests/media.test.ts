import request from 'supertest';
import { createTestApp } from './helpers/app';
import { prisma } from '../src/utils/prisma';

const app = createTestApp();

describe('Media API', () => {
  const screenshotFilenames: string[] = [];
  const audioFilenames: string[] = [];

  afterAll(async () => {
    // Safety net in case a test failed before its own DELETE call ran.
    if (screenshotFilenames.length > 0) {
      await prisma.screenshot.deleteMany({ where: { filename: { in: screenshotFilenames } } });
    }
    if (audioFilenames.length > 0) {
      await prisma.audioRecord.deleteMany({ where: { filename: { in: audioFilenames } } });
    }
    await prisma.$disconnect();
  });

  it('POST /media/screenshots with no file returns 400', async () => {
    const res = await request(app).post('/media/screenshots');
    expect(res.status).toBe(400);
  });

  it('uploads, lists, and deletes a screenshot', async () => {
    const uploadRes = await request(app)
      .post('/media/screenshots')
      .attach('file', Buffer.from('fake-png-bytes'), 'test.png');

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.filename).toBeDefined();
    const filename = uploadRes.body.filename as string;
    screenshotFilenames.push(filename);

    const listRes = await request(app).get('/media/screenshots');
    expect(listRes.status).toBe(200);
    expect(listRes.body.files.some((f: any) => f.filename === filename)).toBe(true);

    const delRes = await request(app).delete(`/media/screenshots/${encodeURIComponent(filename)}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.fileDeleted).toBe(true);
    expect(delRes.body.dbRecordsDeleted).toBeGreaterThanOrEqual(1);
  });

  it('POST /media/audio with no file returns 400', async () => {
    const res = await request(app).post('/media/audio');
    expect(res.status).toBe(400);
  });

  it('uploads, lists, and deletes an audio file', async () => {
    const uploadRes = await request(app)
      .post('/media/audio')
      .attach('file', Buffer.from('fake-audio-bytes'), 'test.wav');

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.filename).toBeDefined();
    const filename = uploadRes.body.filename as string;
    audioFilenames.push(filename);

    const listRes = await request(app).get('/media/audio');
    expect(listRes.status).toBe(200);
    expect(listRes.body.files.some((f: any) => f.filename === filename)).toBe(true);

    const delRes = await request(app).delete(`/media/audio/${encodeURIComponent(filename)}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.fileDeleted).toBe(true);
    expect(delRes.body.dbRecordsDeleted).toBeGreaterThanOrEqual(1);
  });
});
