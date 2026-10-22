import { Request, Response } from 'express';
import * as flashcardService from './flashcard.service';
import { asyncHandler } from '../../utils/async-handler';
import { NotFoundError, BadRequestError } from '../../errors/app-error';

// -------------------------------------------------------------
// Deck Controllers
// -------------------------------------------------------------

export const getAllDecks = asyncHandler(async (req: Request, res: Response) => {
  const decks = await flashcardService.getAllDecks();
  res.status(200).json(decks);
});

export const getDeckById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deck = await flashcardService.getDeckById(id);
  if (!deck) {
    throw new NotFoundError('Deck not found');
  }
  res.status(200).json(deck);
});

export const createDeck = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name) {
    throw new BadRequestError('Deck name is required');
  }
  const deck = await flashcardService.createDeck({ name, description });
  res.status(201).json(deck);
});

export const updateDeck = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deck = await flashcardService.updateDeck(id, req.body);
  res.status(200).json(deck);
});

export const deleteDeck = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await flashcardService.deleteDeck(id);
  res.status(200).json({ message: 'Deck deleted successfully' });
});

// -------------------------------------------------------------
// Flashcard Controllers
// -------------------------------------------------------------

export const getAllFlashcards = asyncHandler(async (req: Request, res: Response) => {
  const { deckId, dueOnly, search, page, limit } = req.query;
  const result = await flashcardService.getAllFlashcards({
    deckId: deckId as string,
    dueOnly: dueOnly === 'true',
    search: search as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined
  });
  res.status(200).json(result);
});

export const getFlashcardById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const card = await flashcardService.getFlashcardById(id);
  if (!card) {
    throw new NotFoundError('Flashcard not found');
  }
  res.status(200).json(card);
});

export const createFlashcard = asyncHandler(async (req: Request, res: Response) => {
  const { deckId, termId, front, back, externalNoteId } = req.body;
  if (!deckId || !termId || !front || !back) {
    throw new BadRequestError('deckId, termId, front, and back are required');
  }
  const card = await flashcardService.createFlashcard({ deckId, termId, front, back, externalNoteId });
  res.status(201).json(card);
});

export const updateFlashcard = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const card = await flashcardService.updateFlashcard(id, req.body);
  res.status(200).json(card);
});

export const deleteFlashcard = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await flashcardService.deleteFlashcard(id);
  res.status(200).json({ message: 'Flashcard deleted successfully' });
});

export const reviewFlashcard = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quality } = req.body; // Score 0 to 5
  if (quality === undefined || typeof quality !== 'number' || quality < 0 || quality > 5) {
    throw new BadRequestError('Quality score must be a number between 0 and 5');
  }
  const card = await flashcardService.reviewFlashcard(id, quality);
  res.status(200).json(card);
});
