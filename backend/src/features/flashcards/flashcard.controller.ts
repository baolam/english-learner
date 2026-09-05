import { Request, Response } from 'express';
import * as flashcardService from './flashcard.service';

// -------------------------------------------------------------
// Deck Controllers
// -------------------------------------------------------------

export const getAllDecks = async (req: Request, res: Response) => {
  try {
    const decks = await flashcardService.getAllDecks();
    res.status(200).json(decks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDeckById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deck = await flashcardService.getDeckById(id);
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    res.status(200).json(deck);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createDeck = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Deck name is required' });
    const deck = await flashcardService.createDeck({ name, description });
    res.status(201).json(deck);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDeck = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deck = await flashcardService.updateDeck(id, req.body);
    res.status(200).json(deck);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDeck = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await flashcardService.deleteDeck(id);
    res.status(200).json({ message: 'Deck deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------------------------
// Flashcard Controllers
// -------------------------------------------------------------

export const getAllFlashcards = async (req: Request, res: Response) => {
  try {
    const { deckId, dueOnly, search, page, limit } = req.query;
    const result = await flashcardService.getAllFlashcards({
      deckId: deckId as string,
      dueOnly: dueOnly === 'true',
      search: search as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFlashcardById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const card = await flashcardService.getFlashcardById(id);
    if (!card) return res.status(404).json({ error: 'Flashcard not found' });
    res.status(200).json(card);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createFlashcard = async (req: Request, res: Response) => {
  try {
    const { deckId, termId, front, back, externalNoteId } = req.body;
    if (!deckId || !termId || !front || !back) {
      return res.status(400).json({ error: 'deckId, termId, front, and back are required' });
    }
    const card = await flashcardService.createFlashcard({ deckId, termId, front, back, externalNoteId });
    res.status(201).json(card);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFlashcard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const card = await flashcardService.updateFlashcard(id, req.body);
    res.status(200).json(card);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFlashcard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await flashcardService.deleteFlashcard(id);
    res.status(200).json({ message: 'Flashcard deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const reviewFlashcard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quality } = req.body; // Score 0 to 5
    if (quality === undefined || typeof quality !== 'number' || quality < 0 || quality > 5) {
      return res.status(400).json({ error: 'Quality score must be a number between 0 and 5' });
    }
    const card = await flashcardService.reviewFlashcard(id, quality);
    res.status(200).json(card);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
