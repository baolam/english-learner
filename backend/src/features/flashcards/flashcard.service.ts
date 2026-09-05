import { prisma } from '../../utils/prisma';

// -------------------------------------------------------------
// Deck CRUD Operations
// -------------------------------------------------------------

export const getAllDecks = async () => {
  return prisma.deck.findMany({
    include: {
      _count: { select: { flashcards: true } }
    },
    orderBy: { name: 'asc' }
  });
};

export const getDeckById = async (id: string) => {
  return prisma.deck.findUnique({
    where: { id },
    include: {
      flashcards: {
        include: { term: true },
        orderBy: { nextReviewDate: 'asc' }
      }
    }
  });
};

export const createDeck = async (data: { name: string; description?: string }) => {
  return prisma.deck.create({ data });
};

export const updateDeck = async (id: string, data: { name?: string; description?: string }) => {
  return prisma.deck.update({
    where: { id },
    data
  });
};

export const deleteDeck = async (id: string) => {
  return prisma.deck.delete({ where: { id } });
};

// -------------------------------------------------------------
// Flashcard CRUD & SM-2 Operations
// -------------------------------------------------------------

export interface FlashcardQueryParams {
  deckId?: string;
  dueOnly?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const getAllFlashcards = async (query: FlashcardQueryParams = {}) => {
  const { deckId, dueOnly, search, page = 1, limit = 20 } = query;

  const where: any = {};
  if (deckId) where.deckId = deckId;
  if (dueOnly) where.nextReviewDate = { lte: new Date() };
  if (search) {
    where.OR = [
      { front: { contains: search } },
      { back: { contains: search } }
    ];
  }

  const skip = (page - 1) * limit;

  const [total, flashcards] = await Promise.all([
    prisma.flashcard.count({ where }),
    prisma.flashcard.findMany({
      where,
      include: {
        deck: { select: { id: true, name: true } },
        term: true
      },
      orderBy: { nextReviewDate: 'asc' },
      skip,
      take: limit
    })
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: flashcards
  };
};

export const getFlashcardById = async (id: string) => {
  return prisma.flashcard.findUnique({
    where: { id },
    include: { deck: true, term: true }
  });
};

export const createFlashcard = async (data: {
  deckId: string;
  termId: string;
  front: string;
  back: string;
  externalNoteId?: string;
}) => {
  return prisma.flashcard.create({ data });
};

export const updateFlashcard = async (
  id: string,
  data: Partial<{
    deckId: string;
    front: string;
    back: string;
    externalNoteId: string;
  }>
) => {
  return prisma.flashcard.update({
    where: { id },
    data
  });
};

export const deleteFlashcard = async (id: string) => {
  return prisma.flashcard.delete({ where: { id } });
};

/**
 * Reviews a flashcard using the SM-2 Spaced Repetition Algorithm.
 * @param id Flashcard ID
 * @param quality Score from 0 to 5 (0: complete blackout, 5: perfect response)
 */
export const reviewFlashcard = async (id: string, quality: number) => {
  const card = await prisma.flashcard.findUnique({ where: { id } });
  if (!card) throw new Error('Flashcard not found');

  let { interval, repetition, easeFactor } = card;

  if (quality < 3) {
    repetition = 0;
    interval = 1;
  } else {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  }

  // Calculate new Ease Factor (EF)
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return prisma.flashcard.update({
    where: { id },
    data: {
      interval,
      repetition,
      easeFactor,
      nextReviewDate
    }
  });
};
