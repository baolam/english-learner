import request from 'supertest';
import { createTestApp } from './helpers/app';
import { prisma } from '../src/utils/prisma';

const app = createTestApp();
const PREFIX = 'TEST_SCHEDULE_';
const name = (suffix: string) => `${PREFIX}${suffix}_${Date.now()}`;

const future = (ms: number) => new Date(Date.now() + ms).toISOString();

describe('Schedules API', () => {
  const createdIds: string[] = [];

  afterAll(async () => {
    await prisma.schedule.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it('rejects creating a schedule with no title/startTime/endTime (400)', async () => {
    const res = await request(app).post('/api/schedules').send({ description: 'no title' });
    expect(res.status).toBe(400);
  });

  it('creates a schedule (200)', async () => {
    const res = await request(app)
      .post('/api/schedules')
      .send({
        title: name('create'),
        startTime: future(3600000),
        endTime: future(7200000)
      });

    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
    createdIds.push(res.body.id);
  });

  it('lists schedules including the one just created', async () => {
    const created = await request(app)
      .post('/api/schedules')
      .send({ title: name('listed'), startTime: future(3600000), endTime: future(7200000) });
    createdIds.push(created.body.id);

    const res = await request(app).get('/api/schedules');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.map((s: any) => s.id)).toContain(created.body.id);
  });

  it('gets a schedule by id (200) and 404s for a bogus id', async () => {
    const created = await request(app)
      .post('/api/schedules')
      .send({ title: name('getbyid'), startTime: future(3600000), endTime: future(7200000) });
    createdIds.push(created.body.id);

    const ok = await request(app).get(`/api/schedules/${created.body.id}`);
    expect(ok.status).toBe(200);
    expect(ok.body.id).toBe(created.body.id);

    const notFound = await request(app).get('/api/schedules/does-not-exist');
    expect(notFound.status).toBe(404);
  });

  it('updates a schedule title (200)', async () => {
    const created = await request(app)
      .post('/api/schedules')
      .send({ title: name('before-update'), startTime: future(3600000), endTime: future(7200000) });
    createdIds.push(created.body.id);

    const res = await request(app)
      .put(`/api/schedules/${created.body.id}`)
      .send({ title: 'updated title' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('updated title');
  });

  it('resets lastReminderThreshold when startTime is rescheduled', async () => {
    const created = await request(app)
      .post('/api/schedules')
      .send({ title: name('reschedule'), startTime: future(3600000), endTime: future(7200000) });
    createdIds.push(created.body.id);

    // Simulate a reminder having already fired for the old start time.
    await prisma.schedule.update({
      where: { id: created.body.id },
      data: { lastReminderThreshold: 5 }
    });

    const res = await request(app)
      .put(`/api/schedules/${created.body.id}`)
      .send({ startTime: future(10 * 3600000) });

    expect(res.status).toBe(200);

    const row = await prisma.schedule.findUnique({ where: { id: created.body.id } });
    expect(row?.lastReminderThreshold).toBeNull();
  });

  it('deletes a schedule (200) and then 404s on fetch', async () => {
    const created = await request(app)
      .post('/api/schedules')
      .send({ title: name('to-delete'), startTime: future(3600000), endTime: future(7200000) });

    const del = await request(app).delete(`/api/schedules/${created.body.id}`);
    expect(del.status).toBe(200);

    const getAfterDelete = await request(app).get(`/api/schedules/${created.body.id}`);
    expect(getAfterDelete.status).toBe(404);
  });
});
