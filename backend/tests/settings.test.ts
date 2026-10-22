import request from 'supertest';
import { createTestApp } from './helpers/app';

const app = createTestApp();

describe('Settings API', () => {
  let originalSettings: Record<string, any>;

  beforeAll(async () => {
    const res = await request(app).get('/api/settings');
    originalSettings = res.body;
  });

  afterAll(async () => {
    // Restore the singleton row to its pre-test values so later runs/files
    // aren't affected by this file's mutations.
    const { id, createdAt, updatedAt, ...restorable } = originalSettings;
    await request(app).put('/api/settings').send(restorable);
  });

  it('gets settings, auto-creating the singleton row (200)', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('default');
    expect(res.body.defaultDeckName).toBeDefined();
    expect(res.body.screenshotHotkey).toBeDefined();
    expect(typeof res.body.vadEnabled).toBe('boolean');
    expect(res.body.marqueeText).toBeDefined();
  });

  it('updates marqueeText (200) and persists it', async () => {
    const newText = 'TEST_MARQUEE_' + Date.now();
    const res = await request(app).put('/api/settings').send({ marqueeText: newText });
    expect(res.status).toBe(200);
    expect(res.body.marqueeText).toBe(newText);

    const getAgain = await request(app).get('/api/settings');
    expect(getAgain.status).toBe(200);
    expect(getAgain.body.marqueeText).toBe(newText);
  });

  it('updates vadThreshold (200)', async () => {
    const res = await request(app).put('/api/settings').send({ vadThreshold: 0.33 });
    expect(res.status).toBe(200);
    expect(res.body.vadThreshold).toBe(0.33);
  });
});
