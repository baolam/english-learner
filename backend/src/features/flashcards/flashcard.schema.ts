import { z } from 'zod';

export const createDeckSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Deck name is required'),
    description: z.string().optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const createFlashcardSchema = z.object({
  body: z.object({
    deckId: z.string().min(1, 'deckId is required'),
    termId: z.string().min(1, 'termId is required'),
    front: z.string().min(1, 'front is required'),
    back: z.string().min(1, 'back is required'),
    externalNoteId: z.string().optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});
