import { Router } from 'express';
import { AnkiController } from './anki.controller';

const router = Router();

/**
 * @openapi
 * /anki/cards-info:
 *   post:
 *     summary: Retrieve detailed Anki card information by array of card IDs
 *     tags: [Anki]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cards]
 *             properties:
 *               cards:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Card info returned successfully
 *       400:
 *         description: Cards must be an array of IDs
 */
router.post('/cards-info', AnkiController.getCardsInfo);

/**
 * @openapi
 * /anki/decks:
 *   get:
 *     summary: Get list of all Anki deck names
 *     tags: [Anki]
 *     responses:
 *       200:
 *         description: List of deck names
 */
router.get('/decks', AnkiController.getDecks);

/**
 * @openapi
 * /anki/word-status:
 *   get:
 *     summary: Check status of a specific word in Anki
 *     tags: [Anki]
 *     parameters:
 *       - in: query
 *         name: word
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Word status info
 *       400:
 *         description: Word parameter required
 */
router.get('/word-status', AnkiController.getWordStatus);

/**
 * @openapi
 * /anki/learn:
 *   get:
 *     summary: Get cards to learn for a specific deck
 *     tags: [Anki]
 *     parameters:
 *       - in: query
 *         name: deck
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cards to learn
 *       400:
 *         description: Deck parameter required
 */
router.get('/learn', AnkiController.getCardsToLearn);

/**
 * @openapi
 * /anki/review:
 *   get:
 *     summary: Get cards to review for a specific deck
 *     tags: [Anki]
 *     parameters:
 *       - in: query
 *         name: deck
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cards to review
 *       400:
 *         description: Deck parameter required
 */
router.get('/review', AnkiController.getCardsToReview);

export default router;
