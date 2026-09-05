import { Router } from 'express';
import * as flashcardController from './flashcard.controller';

const router = Router();

// Deck Endpoints
router.get('/decks', flashcardController.getAllDecks);
router.get('/decks/:id', flashcardController.getDeckById);
router.post('/decks', flashcardController.createDeck);
router.put('/decks/:id', flashcardController.updateDeck);
router.delete('/decks/:id', flashcardController.deleteDeck);

// Flashcard Endpoints
router.get('/', flashcardController.getAllFlashcards);
router.get('/:id', flashcardController.getFlashcardById);
router.post('/', flashcardController.createFlashcard);
router.put('/:id', flashcardController.updateFlashcard);
router.delete('/:id', flashcardController.deleteFlashcard);

// Review Endpoint (SM-2)
router.post('/:id/review', flashcardController.reviewFlashcard);

export default router;
