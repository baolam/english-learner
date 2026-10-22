import request from 'supertest';
import { createTestApp } from './helpers/app';
import { prisma } from '../src/utils/prisma';

const app = createTestApp();

const PREFIX = 'TEST_TERM_';
const term = (suffix: string) => `${PREFIX}${suffix}_${Date.now()}`;

describe('Terms API', () => {
  const termIds: string[] = [];

  afterAll(async () => {
    await prisma.term.deleteMany({ where: { id: { in: termIds } } });
    await prisma.$disconnect();
  });

  it('rejects creating a term with no term text (400)', async () => {
    const res = await request(app).post('/api/terms').send({ contextSentence: 'no term here' });
    expect(res.status).toBe(400);
  });

  it('creates a term with just the term text (201)', async () => {
    const res = await request(app).post('/api/terms').send({ term: term('minimal') });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    termIds.push(res.body.id);
  });

  it('creates a term with termType, sourceType, contextSentence, aiExplanation (201)', async () => {
    const payload = {
      term: term('full'),
      termType: 'CONCEPT',
      sourceType: 'READING',
      contextSentence: 'This appeared in a research paper.',
      aiExplanation: 'A concept frequently used in academic writing.'
    };
    const res = await request(app).post('/api/terms').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.termType).toBe('CONCEPT');
    expect(res.body.sourceType).toBe('READING');
    expect(res.body.contextSentence).toBe(payload.contextSentence);
    expect(res.body.aiExplanation).toBe(payload.aiExplanation);
    termIds.push(res.body.id);
  });

  it('lists terms including the one just created (paginated shape)', async () => {
    const created = await request(app).post('/api/terms').send({ term: term('listed') });
    termIds.push(created.body.id);

    const res = await request(app).get('/api/terms');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limit');
    expect(res.body).toHaveProperty('totalPages');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.map((t: any) => t.id)).toContain(created.body.id);
  });

  it('filters terms by termType', async () => {
    const created = await request(app)
      .post('/api/terms')
      .send({ term: term('vocab-filter'), termType: 'VOCAB' });
    termIds.push(created.body.id);

    const res = await request(app).get('/api/terms').query({ termType: 'VOCAB' });
    expect(res.status).toBe(200);
    expect(res.body.data.map((t: any) => t.id)).toContain(created.body.id);
    expect(res.body.data.every((t: any) => t.termType === 'VOCAB')).toBe(true);
  });

  it('gets a term by id', async () => {
    const created = await request(app).post('/api/terms').send({ term: term('get-by-id') });
    termIds.push(created.body.id);

    const res = await request(app).get(`/api/terms/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  it('returns 404 for a non-existent term id', async () => {
    const res = await request(app).get('/api/terms/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('updates a term', async () => {
    const created = await request(app).post('/api/terms').send({ term: term('before-update') });
    termIds.push(created.body.id);

    const res = await request(app)
      .put(`/api/terms/${created.body.id}`)
      .send({ term: term('after-update'), contextSentence: 'updated context' });

    expect(res.status).toBe(200);
    expect(res.body.contextSentence).toBe('updated context');
  });

  it('deletes a term', async () => {
    const created = await request(app).post('/api/terms').send({ term: term('to-delete') });

    const del = await request(app).delete(`/api/terms/${created.body.id}`);
    expect(del.status).toBe(200);

    const getAfterDelete = await request(app).get(`/api/terms/${created.body.id}`);
    expect(getAfterDelete.status).toBe(404);
  });
});
