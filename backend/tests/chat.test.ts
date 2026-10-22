import request from 'supertest';
import { createTestApp } from './helpers/app';
import { prisma } from '../src/utils/prisma';

const app = createTestApp();

const PREFIX = 'TEST_CHAT_';
const name = (suffix: string) => `${PREFIX}${suffix}_${Date.now()}`;

describe('Chat API', () => {
  const sessionIds: string[] = [];

  afterAll(async () => {
    // AiChatHistory.chatSessionId is onDelete: Cascade, so deleting a
    // session also removes any messages still attached to it.
    await prisma.chatSession.deleteMany({ where: { id: { in: sessionIds } } });
    await prisma.$disconnect();
  });

  it('creates a chat session with defaults when body is empty (201)', async () => {
    const res = await request(app).post('/api/chat/sessions').send({});
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New Chat');
    expect(res.body.sourceType).toBe('GENERAL');
    sessionIds.push(res.body.id);
  });

  it('creates a named chat session (201)', async () => {
    const res = await request(app).post('/api/chat/sessions').send({ title: name('session') });
    expect(res.status).toBe(201);
    sessionIds.push(res.body.id);
  });

  it('lists chat sessions in a paginated shape including the one just created', async () => {
    const res = await request(app).get('/api/chat/sessions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.map((s: any) => s.id)).toContain(sessionIds[1]);
  });

  it('gets a chat session by id with empty messages', async () => {
    const res = await request(app).get(`/api/chat/sessions/${sessionIds[1]}`);
    expect(res.status).toBe(200);
    expect(res.body.messages).toEqual([]);
  });

  it('returns 404 for a non-existent chat session', async () => {
    const res = await request(app).get('/api/chat/sessions/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('updates a chat session title', async () => {
    const newTitle = name('renamed');
    const res = await request(app)
      .put(`/api/chat/sessions/${sessionIds[1]}`)
      .send({ title: newTitle });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(newTitle);
  });

  it('rejects adding a message with no role/message (400)', async () => {
    const res = await request(app).post(`/api/chat/sessions/${sessionIds[1]}/messages`).send({});
    expect(res.status).toBe(400);
  });

  it('adds a message, finds it on the session, then deletes it', async () => {
    const messageText = name('hello');
    const addRes = await request(app)
      .post(`/api/chat/sessions/${sessionIds[1]}/messages`)
      .send({ role: 'USER', message: messageText });

    expect(addRes.status).toBe(201);
    expect(addRes.body.message).toBe(messageText);
    const messageId = addRes.body.id;

    const getRes = await request(app).get(`/api/chat/sessions/${sessionIds[1]}`);
    expect(getRes.body.messages.map((m: any) => m.id)).toContain(messageId);

    const delRes = await request(app).delete(`/api/chat/sessions/messages/${messageId}`);
    expect(delRes.status).toBe(200);

    const afterDelete = await prisma.aiChatHistory.findUnique({ where: { id: messageId } });
    expect(afterDelete).toBeNull();
  });

  it('deletes a chat session', async () => {
    const created = await request(app).post('/api/chat/sessions').send({ title: name('to-delete') });
    const id = created.body.id;

    const del = await request(app).delete(`/api/chat/sessions/${id}`);
    expect(del.status).toBe(200);

    const getAfter = await request(app).get(`/api/chat/sessions/${id}`);
    expect(getAfter.status).toBe(404);
    // Already deleted - nothing to add to sessionIds for cleanup.
  });
});
