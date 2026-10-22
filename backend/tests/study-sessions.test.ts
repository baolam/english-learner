import request from 'supertest';
import { createTestApp } from './helpers/app';
import { prisma } from '../src/utils/prisma';

const app = createTestApp();

const PREFIX = 'TEST_STUDYSESSION_';
const name = (suffix: string) => `${PREFIX}${suffix}_${Date.now()}`;

describe('Study Sessions API', () => {
  const sessionIds: string[] = [];
  const termIds: string[] = [];
  const relationIds: string[] = [];

  afterAll(async () => {
    await prisma.conceptRelation.deleteMany({ where: { id: { in: relationIds } } });
    await prisma.term.deleteMany({ where: { id: { in: termIds } } });
    await prisma.studySession.deleteMany({ where: { id: { in: sessionIds } } });
    await prisma.$disconnect();
  });

  it('creates a study session with an empty body (defaults applied)', async () => {
    const res = await request(app).post('/api/study-sessions').send({});
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('Untitled Session');
    sessionIds.push(res.body.id);
  });

  it('creates a study session with a namespaced title', async () => {
    const res = await request(app).post('/api/study-sessions').send({ title: name('session') });
    expect(res.status).toBe(201);
    sessionIds.push(res.body.id);

    const listRes = await request(app).get('/api/study-sessions');
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveProperty('total');
    expect(listRes.body).toHaveProperty('data');
    expect(listRes.body.data.map((s: any) => s.id)).toContain(res.body.id);
  });

  it('gets a study session by id with nested empty relation arrays', async () => {
    const created = await request(app).post('/api/study-sessions').send({ title: name('nested') });
    sessionIds.push(created.body.id);

    const res = await request(app).get(`/api/study-sessions/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.documents).toEqual([]);
    expect(res.body.terms).toEqual([]);
    expect(res.body.screenshots).toEqual([]);
    expect(res.body.audioRecords).toEqual([]);
    expect(res.body.chatSessions).toEqual([]);
    expect(res.body.conceptRelations).toEqual([]);
  });

  it('returns 404 for a non-existent study session id', async () => {
    const res = await request(app).get('/api/study-sessions/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('updates a study session status/category', async () => {
    const created = await request(app).post('/api/study-sessions').send({ title: name('update') });
    sessionIds.push(created.body.id);

    const res = await request(app)
      .put(`/api/study-sessions/${created.body.id}`)
      .send({ status: 'PAUSED', category: 'CODING' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('PAUSED');
    expect(res.body.category).toBe('CODING');
  });

  it('deletes a study session', async () => {
    const created = await request(app).post('/api/study-sessions').send({ title: name('delete') });

    const del = await request(app).delete(`/api/study-sessions/${created.body.id}`);
    expect(del.status).toBe(200);

    const after = await request(app).get(`/api/study-sessions/${created.body.id}`);
    expect(after.status).toBe(404);
  });

  describe('Concept Relations', () => {
    let sessionId: string;
    let sourceTermId: string;
    let targetTermId: string;

    beforeAll(async () => {
      const session = await request(app).post('/api/study-sessions').send({ title: name('relations-session') });
      sessionId = session.body.id;
      sessionIds.push(sessionId);

      const t1 = await request(app).post('/api/terms').send({ term: name('t1') });
      const t2 = await request(app).post('/api/terms').send({ term: name('t2') });
      sourceTermId = t1.body.id;
      targetTermId = t2.body.id;
      termIds.push(sourceTermId, targetTermId);
    });

    it('rejects a relation missing sourceTermId/targetTermId (400)', async () => {
      const res = await request(app).post(`/api/study-sessions/${sessionId}/relations`).send({});
      expect(res.status).toBe(400);
    });

    it('creates a concept relation with default relationType', async () => {
      const res = await request(app)
        .post(`/api/study-sessions/${sessionId}/relations`)
        .send({ sourceTermId, targetTermId });

      expect(res.status).toBe(201);
      expect(res.body.relationType).toBe('RELATED_TO');
      relationIds.push(res.body.id);
    });

    it('lists concept relations for the session, containing the one just created', async () => {
      const res = await request(app).get(`/api/study-sessions/${sessionId}/relations`);
      expect(res.status).toBe(200);
      expect(res.body.map((r: any) => r.id)).toContain(relationIds[0]);
    });

    it('deletes a concept relation', async () => {
      const del = await request(app).delete(`/api/study-sessions/relations/${relationIds[0]}`);
      expect(del.status).toBe(200);

      const res = await request(app).get(`/api/study-sessions/${sessionId}/relations`);
      expect(res.body.map((r: any) => r.id)).not.toContain(relationIds[0]);
    });
  });
});
