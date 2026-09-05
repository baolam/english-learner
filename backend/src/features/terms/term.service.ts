import { prisma } from '../../utils/prisma';

export interface TermQueryParams {
  termType?: string;
  sourceType?: string;
  documentId?: string;
  screenshotId?: string;
  audioRecordId?: string;
  ankiSyncStatus?: string;
  obsidianSyncStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getAllTerms = async (query: TermQueryParams = {}) => {
  const {
    termType,
    sourceType,
    documentId,
    screenshotId,
    audioRecordId,
    ankiSyncStatus,
    obsidianSyncStatus,
    search,
    page = 1,
    limit = 20
  } = query;

  const where: any = {};
  if (termType) where.termType = termType;
  if (sourceType) where.sourceType = sourceType;
  if (documentId) where.documentId = documentId;
  if (screenshotId) where.screenshotId = screenshotId;
  if (audioRecordId) where.audioRecordId = audioRecordId;
  if (ankiSyncStatus) where.ankiSyncStatus = ankiSyncStatus;
  if (obsidianSyncStatus) where.obsidianSyncStatus = obsidianSyncStatus;
  if (search) {
    where.OR = [
      { term: { contains: search } },
      { contextSentence: { contains: search } },
      { aiExplanation: { contains: search } }
    ];
  }

  const skip = (page - 1) * limit;

  const [total, terms] = await Promise.all([
    prisma.term.count({ where }),
    prisma.term.findMany({
      where,
      include: {
        document: { select: { id: true, title: true } },
        screenshot: { select: { id: true, filename: true } },
        audioRecord: { select: { id: true, filename: true } },
        flashcard: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: terms
  };
};

export const getTermById = async (id: string) => {
  return prisma.term.findUnique({
    where: { id },
    include: {
      document: true,
      screenshot: true,
      audioRecord: true,
      flashcard: true
    }
  });
};

export const createTerm = async (data: {
  term: string;
  termType?: string;
  sourceType?: string;
  documentId?: string;
  screenshotId?: string;
  audioRecordId?: string;
  contextSentence?: string;
  aiExplanation?: string;
  ankiSyncStatus?: string;
  obsidianSyncStatus?: string;
}) => {
  return prisma.term.create({
    data
  });
};

export const updateTerm = async (
  id: string,
  data: Partial<{
    term: string;
    termType: string;
    sourceType: string;
    documentId: string | null;
    screenshotId: string | null;
    audioRecordId: string | null;
    contextSentence: string;
    aiExplanation: string;
    ankiSyncStatus: string;
    obsidianSyncStatus: string;
  }>
) => {
  return prisma.term.update({
    where: { id },
    data
  });
};

export const deleteTerm = async (id: string) => {
  return prisma.term.delete({
    where: { id }
  });
};
