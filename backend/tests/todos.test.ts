import request from 'supertest';
import { createTestApp } from './helpers/app';
import { prisma } from '../src/utils/prisma';

const app = createTestApp();

const PREFIX = 'TEST_TODO_';
const name = (suffix: string) => `${PREFIX}${suffix}_${Date.now()}`;

describe('Todos API', () => {
  const createdIds: string[] = [];

  afterAll(async () => {
    await prisma.todo.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it('rejects creating a todo with no title (400)', async () => {
    const res = await request(app).post('/api/todos').send({ description: 'no title' });
    expect(res.status).toBe(400);
  });

  it('creates a todo (201)', async () => {
    const res = await request(app).post('/api/todos').send({ title: name('simple') });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    createdIds.push(res.body.id);
  });

  it('lists todos including the one just created', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.map((t: any) => t.id)).toContain(createdIds[0]);
  });

  it('creates a child todo linked via parentId, then deletes it', async () => {
    const parentRes = await request(app).post('/api/todos').send({ title: name('parent') });
    createdIds.push(parentRes.body.id);

    const childRes = await request(app)
      .post('/api/todos')
      .send({ title: name('child'), parentId: parentRes.body.id });

    expect(childRes.status).toBe(201);
    expect(childRes.body.parentId).toBe(parentRes.body.id);

    // No GET /api/todos/:id route exists, so verify persistence directly.
    const persisted = await prisma.todo.findUnique({ where: { id: childRes.body.id } });
    expect(persisted?.parentId).toBe(parentRes.body.id);

    const del = await request(app).delete(`/api/todos/${childRes.body.id}`);
    expect(del.status).toBe(200);

    const afterDelete = await prisma.todo.findUnique({ where: { id: childRes.body.id } });
    expect(afterDelete).toBeNull();
  });

  it('updates a todo (title and isCompleted)', async () => {
    const created = await request(app).post('/api/todos').send({ title: name('to-update') });
    createdIds.push(created.body.id);

    const newTitle = name('updated');
    const res = await request(app)
      .put(`/api/todos/${created.body.id}`)
      .send({ title: newTitle, isCompleted: true });

    expect(res.status).toBe(200);
    expect(res.body.isCompleted).toBe(true);
    expect(res.body.title).toBe(newTitle);
  });

  it('cascade-deletes child todos when the parent is deleted (schema.prisma: Todo.parentId onDelete: Cascade)', async () => {
    const parentRes = await request(app).post('/api/todos').send({ title: name('cascade-parent') });
    const childRes = await request(app)
      .post('/api/todos')
      .send({ title: name('cascade-child'), parentId: parentRes.body.id });

    expect(childRes.status).toBe(201);

    const del = await request(app).delete(`/api/todos/${parentRes.body.id}`);
    expect(del.status).toBe(200);

    const childAfter = await prisma.todo.findUnique({ where: { id: childRes.body.id } });
    expect(childAfter).toBeNull(); // cascaded away along with the parent

    const parentAfter = await prisma.todo.findUnique({ where: { id: parentRes.body.id } });
    expect(parentAfter).toBeNull();
    // Both already gone - nothing left to track for afterAll cleanup.
  });
});
