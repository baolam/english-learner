import request from 'supertest';
import { createTestApp } from './helpers/app';
import { prisma } from '../src/utils/prisma';

const app = createTestApp();

const PREFIX = 'TEST_FLASHCARD_';
const name = (suffix: string) => `${PREFIX}${suffix}_${Date.now()}`;

describe('Flashcards API', () => {
  const deckIds: string[] = [];
  const termIds: string[] = [];
  const flashcardIds: string[] = [];

  afterAll(async () => {
    await prisma.flashcard.deleteMany({ where: { id: { in: flashcardIds } } });
    await prisma.term.deleteMany({ where: { id: { in: termIds } } });
    await prisma.deck.deleteMany({ where: { id: { in: deckIds } } });
    await prisma.$disconnect();
  });

  describe('Decks', () => {
    it('rejects creating a deck with no name (400)', async () => {
      const res = await request(app).post('/api/flashcards/decks').send({ description: 'no name' });
      expect(res.status).toBe(400);
    });

    it('creates a deck (201)', async () => {
      const res = await request(app).post('/api/flashcards/decks').send({ name: name('deck') });
      expect(res.status).toBe(201);
      deckIds.push(res.body.id);
    });

    it('lists decks including the one just created', async () => {
      const created = await request(app).post('/api/flashcards/decks').send({ name: name('deck-listed') });
      deckIds.push(created.body.id);

      const res = await request(app).get('/api/flashcards/decks');
      expect(res.status).toBe(200);
      expect(res.body.map((d: any) => d.id)).toContain(created.body.id);
    });

    it('gets a deck by id with nested flashcards array', async () => {
      const created = await request(app).post('/api/flashcards/decks').send({ name: name('deck-detail') });
      deckIds.push(created.body.id);

      const res = await request(app).get(`/api/flashcards/decks/${created.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body.flashcards).toEqual([]);
    });

    it('returns 404 for a non-existent deck id', async () => {
      const res = await request(app).get('/api/flashcards/decks/does-not-exist');
      expect(res.status).toBe(404);
    });

    it('updates a deck description', async () => {
      const created = await request(app).post('/api/flashcards/decks').send({ name: name('deck-update') });
      deckIds.push(created.body.id);

      const res = await request(app)
        .put(`/api/flashcards/decks/${created.body.id}`)
        .send({ description: 'updated description' });

      expect(res.status).toBe(200);
      expect(res.body.description).toBe('updated description');
    });

    it('deletes a deck', async () => {
      const created = await request(app).post('/api/flashcards/decks').send({ name: name('deck-delete') });

      const del = await request(app).delete(`/api/flashcards/decks/${created.body.id}`);
      expect(del.status).toBe(200);

      const after = await request(app).get(`/api/flashcards/decks/${created.body.id}`);
      expect(after.status).toBe(404);
    });
  });

  describe('Flashcards (CRUD)', () => {
    let deckId: string;
    let termId: string;
    let flashcardId: string;

    beforeAll(async () => {
      const deck = await request(app).post('/api/flashcards/decks').send({ name: name('crud-deck') });
      deckId = deck.body.id;
      deckIds.push(deckId);

      const term = await request(app).post('/api/terms').send({ term: name('crud-term') });
      termId = term.body.id;
      termIds.push(termId);
    });

    it('rejects creating a flashcard missing required fields (400)', async () => {
      const res = await request(app).post('/api/flashcards').send({ deckId, termId });
      expect(res.status).toBe(400);
    });

    it('creates a flashcard (201) with deckId/termId/front/back', async () => {
      const res = await request(app)
        .post('/api/flashcards')
        .send({ deckId, termId, front: 'front text', back: 'back text' });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.interval).toBe(0);
      expect(res.body.repetition).toBe(0);
      expect(res.body.easeFactor).toBeCloseTo(2.5);
      flashcardId = res.body.id;
      flashcardIds.push(flashcardId);
    });

    it('lists flashcards including the one just created, filterable by deckId', async () => {
      const res = await request(app).get('/api/flashcards');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body.data.map((c: any) => c.id)).toContain(flashcardId);

      const filtered = await request(app).get(`/api/flashcards?deckId=${deckId}`);
      expect(filtered.status).toBe(200);
      expect(filtered.body.data.map((c: any) => c.id)).toContain(flashcardId);
    });

    it('gets a flashcard by id; 404 for a non-existent id', async () => {
      const res = await request(app).get(`/api/flashcards/${flashcardId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(flashcardId);

      const notFound = await request(app).get('/api/flashcards/does-not-exist');
      expect(notFound.status).toBe(404);
    });

    it('updates a flashcard back text', async () => {
      const res = await request(app)
        .put(`/api/flashcards/${flashcardId}`)
        .send({ back: 'updated back text' });

      expect(res.status).toBe(200);
      expect(res.body.back).toBe('updated back text');
    });

    it('deletes a flashcard', async () => {
      const del = await request(app).delete(`/api/flashcards/${flashcardId}`);
      expect(del.status).toBe(200);

      const after = await request(app).get(`/api/flashcards/${flashcardId}`);
      expect(after.status).toBe(404);
    });
  });

  describe('SM-2 review algorithm', () => {
    let deckId: string;

    beforeAll(async () => {
      const deck = await request(app).post('/api/flashcards/decks').send({ name: name('sm2-deck') });
      deckId = deck.body.id;
      deckIds.push(deckId);
    });

    async function createFreshCard(termSuffix: string) {
      const term = await request(app).post('/api/terms').send({ term: name(termSuffix) });
      termIds.push(term.body.id);

      const card = await request(app)
        .post('/api/flashcards')
        .send({ deckId, termId: term.body.id, front: 'f', back: 'b' });
      flashcardIds.push(card.body.id);
      return card.body.id as string;
    }

    it('rejects an invalid quality score (400)', async () => {
      const cardId = await createFreshCard('invalid-quality');

      const tooHigh = await request(app).post(`/api/flashcards/${cardId}/review`).send({ quality: 7 });
      expect(tooHigh.status).toBe(400);

      const missing = await request(app).post(`/api/flashcards/${cardId}/review`).send({});
      expect(missing.status).toBe(400);
    });

    it('applies the "perfect recall" branch twice: interval/repetition progress 0->1->6, easeFactor increases by 0.1 each time', async () => {
      const cardId = await createFreshCard('perfect-recall');

      const first = await request(app).post(`/api/flashcards/${cardId}/review`).send({ quality: 5 });
      expect(first.status).toBe(200);
      expect(first.body.interval).toBe(1);
      expect(first.body.repetition).toBe(1);
      // easeFactor = 2.5 + (0.1 - (5-5)*(0.08+(5-5)*0.02)) = 2.5 + 0.1 = 2.6
      expect(first.body.easeFactor).toBeCloseTo(2.6);

      const second = await request(app).post(`/api/flashcards/${cardId}/review`).send({ quality: 5 });
      expect(second.status).toBe(200);
      expect(second.body.repetition).toBe(2);
      expect(second.body.interval).toBe(6);
      // easeFactor = 2.6 + 0.1 = 2.7
      expect(second.body.easeFactor).toBeCloseTo(2.7);
    });

    it('applies the "forgot" branch (quality < 3): resets repetition to 0 and interval to 1', async () => {
      const cardId = await createFreshCard('forgot');

      const res = await request(app).post(`/api/flashcards/${cardId}/review`).send({ quality: 2 });
      expect(res.status).toBe(200);
      expect(res.body.repetition).toBe(0);
      expect(res.body.interval).toBe(1);
      // easeFactor = 2.5 + (0.1 - (5-2)*(0.08+(5-2)*0.02)) = 2.5 + (0.1 - 3*0.14) = 2.5 - 0.32 = 2.18
      expect(res.body.easeFactor).toBeCloseTo(2.18);
    });
  });
});
