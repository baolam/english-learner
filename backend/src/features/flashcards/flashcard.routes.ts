import { Router } from 'express';
import * as flashcardController from './flashcard.controller';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Deck:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Flashcard:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         deckId:
 *           type: string
 *           format: uuid
 *         termId:
 *           type: string
 *           format: uuid
 *         front:
 *           type: string
 *         back:
 *           type: string
 *         interval:
 *           type: integer
 *         repetition:
 *           type: integer
 *         easeFactor:
 *           type: number
 *         dueDate:
 *           type: string
 *           format: date-time
 *         externalNoteId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/flashcards/decks:
 *   get:
 *     summary: Retrieve list of flashcard decks
 *     tags: [Decks]
 *     responses:
 *       200:
 *         description: List of flashcard decks
 *   post:
 *     summary: Create a new deck
 *     tags: [Decks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Deck created successfully
 *       400:
 *         description: Deck name is required
 */
router.get('/decks', flashcardController.getAllDecks);
router.post('/decks', flashcardController.createDeck);

/**
 * @openapi
 * /api/flashcards/decks/{id}:
 *   get:
 *     summary: Get deck details by ID
 *     tags: [Decks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deck detail
 *       404:
 *         description: Deck not found
 *   put:
 *     summary: Update an existing deck
 *     tags: [Decks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Deck updated successfully
 *   delete:
 *     summary: Delete a deck
 *     tags: [Decks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deck deleted successfully
 */
router.get('/decks/:id', flashcardController.getDeckById);
router.put('/decks/:id', flashcardController.updateDeck);
router.delete('/decks/:id', flashcardController.deleteDeck);

/**
 * @openapi
 * /api/flashcards:
 *   get:
 *     summary: Retrieve list of flashcards with optional filtering
 *     tags: [Flashcards]
 *     parameters:
 *       - in: query
 *         name: deckId
 *         schema:
 *           type: string
 *       - in: query
 *         name: dueOnly
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of flashcards
 *   post:
 *     summary: Create a new flashcard
 *     tags: [Flashcards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deckId, termId, front, back]
 *             properties:
 *               deckId:
 *                 type: string
 *               termId:
 *                 type: string
 *               front:
 *                 type: string
 *               back:
 *                 type: string
 *               externalNoteId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Flashcard created successfully
 *       400:
 *         description: Missing required fields
 */
router.get('/', flashcardController.getAllFlashcards);
router.post('/', flashcardController.createFlashcard);

/**
 * @openapi
 * /api/flashcards/{id}:
 *   get:
 *     summary: Get flashcard details by ID
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Flashcard detail
 *       404:
 *         description: Flashcard not found
 *   put:
 *     summary: Update an existing flashcard
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               front:
 *                 type: string
 *               back:
 *                 type: string
 *               deckId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Flashcard updated successfully
 *   delete:
 *     summary: Delete a flashcard
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Flashcard deleted successfully
 */
router.get('/:id', flashcardController.getFlashcardById);
router.put('/:id', flashcardController.updateFlashcard);
router.delete('/:id', flashcardController.deleteFlashcard);

/**
 * @openapi
 * /api/flashcards/{id}/review:
 *   post:
 *     summary: Submit SM-2 review score for a flashcard
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quality]
 *             properties:
 *               quality:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 5
 *                 description: SM-2 recall rating (0 = blackout, 5 = perfect recall)
 *     responses:
 *       200:
 *         description: Review recorded and SM-2 interval updated
 *       400:
 *         description: Quality score must be between 0 and 5
 */
router.post('/:id/review', flashcardController.reviewFlashcard);

export default router;
