import request from 'supertest';
import { createTestApp } from './helpers/app';
import { prisma } from '../src/utils/prisma';

const app = createTestApp();

const PREFIX = 'TEST_DOCUMENT_';
const title = (suffix: string) => `${PREFIX}${suffix}_${Date.now()}`;

describe('Documents API', () => {
  const documentIds: string[] = [];
  const highlightIds: string[] = [];

  afterAll(async () => {
    // Highlight model cascades on Document delete, but clean up explicitly
    // in case a highlight's parent document was never created/tracked.
    await prisma.highlight.deleteMany({ where: { id: { in: highlightIds } } });
    await prisma.document.deleteMany({ where: { id: { in: documentIds } } });
    await prisma.$disconnect();
  });

  it('rejects creating a document with no title (400)', async () => {
    const res = await request(app).post('/api/documents').send({ content: 'no title' });
    expect(res.status).toBe(400);
  });

  it('creates a document with just a title (201)', async () => {
    const res = await request(app).post('/api/documents').send({ title: title('minimal') });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    documentIds.push(res.body.id);
  });

  it('creates a document with fileType and status (201)', async () => {
    const res = await request(app)
      .post('/api/documents')
      .send({ title: title('typed'), fileType: 'TEXT', status: 'READING' });

    expect(res.status).toBe(201);
    expect(res.body.fileType).toBe('TEXT');
    expect(res.body.status).toBe('READING');
    documentIds.push(res.body.id);
  });

  it('lists documents including the one just created', async () => {
    const created = await request(app).post('/api/documents').send({ title: title('listed') });
    documentIds.push(created.body.id);

    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.map((d: any) => d.id)).toContain(created.body.id);
  });

  it('filters documents by status', async () => {
    const created = await request(app)
      .post('/api/documents')
      .send({ title: title('reading-filter'), status: 'READING' });
    documentIds.push(created.body.id);

    const res = await request(app).get('/api/documents').query({ status: 'READING' });
    expect(res.status).toBe(200);
    expect(res.body.data.map((d: any) => d.id)).toContain(created.body.id);
    expect(res.body.data.every((d: any) => d.status === 'READING')).toBe(true);
  });

  it('gets a document by id with nested relations', async () => {
    const created = await request(app).post('/api/documents').send({ title: title('get-by-id') });
    documentIds.push(created.body.id);

    const res = await request(app).get(`/api/documents/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
    expect(Array.isArray(res.body.tags)).toBe(true);
    expect(Array.isArray(res.body.highlights)).toBe(true);
  });

  it('returns 404 for a non-existent document id', async () => {
    const res = await request(app).get('/api/documents/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('updates a document', async () => {
    const created = await request(app).post('/api/documents').send({ title: title('before-update') });
    documentIds.push(created.body.id);

    const res = await request(app)
      .put(`/api/documents/${created.body.id}`)
      .send({ title: title('after-update'), status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('COMPLETED');
  });

  it('deletes a document', async () => {
    const created = await request(app).post('/api/documents').send({ title: title('to-delete') });

    const del = await request(app).delete(`/api/documents/${created.body.id}`);
    expect(del.status).toBe(200);

    const getAfterDelete = await request(app).get(`/api/documents/${created.body.id}`);
    expect(getAfterDelete.status).toBe(404);
  });

  describe('Highlights sub-resource', () => {
    let documentId: string;

    beforeAll(async () => {
      const created = await request(app).post('/api/documents').send({ title: title('with-highlights') });
      documentId = created.body.id;
      documentIds.push(documentId);
    });

    it('rejects creating a highlight with no text (400)', async () => {
      const res = await request(app).post(`/api/documents/${documentId}/highlights`).send({});
      expect(res.status).toBe(400);
    });

    it('creates a highlight (201)', async () => {
      const res = await request(app)
        .post(`/api/documents/${documentId}/highlights`)
        .send({ text: 'a highlighted passage' });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.documentId).toBe(documentId);
      highlightIds.push(res.body.id);
    });

    it('lists highlights for the document', async () => {
      const res = await request(app).get(`/api/documents/${documentId}/highlights`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((h: any) => h.id === highlightIds[0])).toBe(true);
    });

    it('updates a highlight via the flat /api/documents/highlights/:highlightId route', async () => {
      const res = await request(app)
        .put(`/api/documents/highlights/${highlightIds[0]}`)
        .send({ text: 'updated passage text' });

      expect(res.status).toBe(200);
      expect(res.body.text).toBe('updated passage text');
    });

    it('deletes a highlight via the flat route', async () => {
      const toDelete = await request(app)
        .post(`/api/documents/${documentId}/highlights`)
        .send({ text: 'temporary highlight' });

      const del = await request(app).delete(`/api/documents/highlights/${toDelete.body.id}`);
      expect(del.status).toBe(200);
    });
  });
});
