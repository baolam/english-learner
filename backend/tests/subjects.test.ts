import request from 'supertest';
import { createTestApp } from './helpers/app';
import { prisma } from '../src/utils/prisma';

const app = createTestApp();

// Namespaced so assertions never depend on what other test files left behind
// in the shared test.db (all test files run sequentially against it).
const PREFIX = 'TEST_SUBJECT_';
const name = (suffix: string) => `${PREFIX}${suffix}_${Date.now()}`;

describe('Subjects API', () => {
  const createdIds: string[] = [];

  afterAll(async () => {
    await prisma.subject.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it('rejects creating a subject with no name (400)', async () => {
    const res = await request(app).post('/api/subjects').send({ description: 'no name' });
    expect(res.status).toBe(400);
  });

  it('creates a subject (201)', async () => {
    const res = await request(app)
      .post('/api/subjects')
      .send({ name: name('root'), description: 'root subject' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.description).toBe('root subject');
    createdIds.push(res.body.id);
  });

  it('creates a child subject linked via parentId', async () => {
    const parentRes = await request(app).post('/api/subjects').send({ name: name('parent') });
    createdIds.push(parentRes.body.id);

    const childRes = await request(app)
      .post('/api/subjects')
      .send({ name: name('child'), parentId: parentRes.body.id });
    createdIds.push(childRes.body.id);

    expect(childRes.status).toBe(201);
    expect(childRes.body.parentId).toBe(parentRes.body.id);

    const getParent = await request(app).get(`/api/subjects/${parentRes.body.id}`);
    expect(getParent.status).toBe(200);
    expect(getParent.body.subSubjects.map((s: any) => s.id)).toContain(childRes.body.id);
  });

  it('lists subjects including the one just created', async () => {
    const created = await request(app).post('/api/subjects').send({ name: name('listed') });
    createdIds.push(created.body.id);

    const res = await request(app).get('/api/subjects');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.map((s: any) => s.id)).toContain(created.body.id);
  });

  it('returns 404 for a non-existent subject id', async () => {
    const res = await request(app).get('/api/subjects/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('updates a subject', async () => {
    const created = await request(app).post('/api/subjects').send({ name: name('before-update') });
    createdIds.push(created.body.id);

    const res = await request(app)
      .put(`/api/subjects/${created.body.id}`)
      .send({ description: 'updated description' });

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('updated description');
  });

  it('deletes a subject', async () => {
    const created = await request(app).post('/api/subjects').send({ name: name('to-delete') });

    const del = await request(app).delete(`/api/subjects/${created.body.id}`);
    expect(del.status).toBe(200);

    const getAfterDelete = await request(app).get(`/api/subjects/${created.body.id}`);
    expect(getAfterDelete.status).toBe(404);
  });
});
