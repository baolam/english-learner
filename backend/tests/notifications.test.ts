import request from 'supertest';
import { createTestApp } from './helpers/app';
import { prisma } from '../src/utils/prisma';

const app = createTestApp();
const PREFIX = 'TEST_NOTIF_';
const name = (suffix: string) => `${PREFIX}${suffix}_${Date.now()}`;

describe('Notifications API', () => {
  const createdIds: string[] = [];

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it('rejects creating a notification with no title/body (400)', async () => {
    const res = await request(app).post('/api/notifications').send({ title: 'only title' });
    expect(res.status).toBe(400);
  });

  it('creates a notification (200)', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({ title: name('title'), body: 'some body text' });

    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
    expect(res.body.body).toBe('some body text');
    createdIds.push(res.body.id);
  });

  it('lists notifications including the one just created', async () => {
    const created = await request(app)
      .post('/api/notifications')
      .send({ title: name('listed'), body: 'body' });
    createdIds.push(created.body.id);

    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.map((n: any) => n.id)).toContain(created.body.id);
  });

  it('marks a notification as read (200)', async () => {
    const created = await request(app)
      .post('/api/notifications')
      .send({ title: name('to-read'), body: 'body' });
    createdIds.push(created.body.id);
    expect(created.body.isRead).toBe(false);

    const res = await request(app).put(`/api/notifications/${created.body.id}/read`);
    expect(res.status).toBe(200);
    expect(res.body.isRead).toBe(true);
  });
});
