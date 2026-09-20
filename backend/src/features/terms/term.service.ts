import { prisma } from '../../utils/prisma';

export interface TermQueryParams {
  termType?: string;
  sourceType?: string;
  documentId?: string;
  screenshotId?: string;
  audioRecordId?: string;
  sessionId?: string;
  ankiSyncStatus?: string;
  obsidianSyncStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const parseTagNames = (tagsInput?: string | string[]): string[] => {
  if (!tagsInput) return [];
  if (Array.isArray(tagsInput)) return tagsInput.map((t) => t.trim()).filter(Boolean);
  return tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
};

export const getAllTerms = async (query: TermQueryParams = {}) => {
  const {
    termType,
    sourceType,
    documentId,
    screenshotId,
    audioRecordId,
    sessionId,
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
  if (sessionId) where.sessionId = sessionId;
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
        studySession: { select: { id: true, title: true, category: true } },
        tags: true,
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
      studySession: true,
      tags: true,
      flashcard: true,
      outgoing: { include: { targetTerm: true } },
      incoming: { include: { sourceTerm: true } }
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
  sessionId?: string;
  contextSentence?: string;
  aiExplanation?: string;
  ankiSyncStatus?: string;
  obsidianSyncStatus?: string;
  tags?: string | string[];
}) => {
  const { tags, ...restData } = data;
  const tagNames = parseTagNames(tags);

  return prisma.term.create({
    data: {
      ...restData,
      tags: tagNames.length > 0 ? {
        connectOrCreate: tagNames.map((name) => ({
          where: { name },
          create: { name }
        }))
      } : undefined
    },
    include: {
      tags: true,
      studySession: true
    }
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
    sessionId: string | null;
    contextSentence: string;
    aiExplanation: string;
    ankiSyncStatus: string;
    obsidianSyncStatus: string;
    tags: string | string[];
  }>
) => {
  const { tags, ...restData } = data;
  const updateData: any = { ...restData };

  if (tags !== undefined) {
    const tagNames = parseTagNames(tags);
    updateData.tags = {
      set: [],
      connectOrCreate: tagNames.map((name) => ({
        where: { name },
        create: { name }
      }))
    };
  }

  return prisma.term.update({
    where: { id },
    data: updateData,
    include: {
      tags: true,
      studySession: true
    }
  });
};

export const deleteTerm = async (id: string) => {
  return prisma.term.delete({
    where: { id }
  });
};
