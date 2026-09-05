import { prisma } from '../../utils/prisma';

export interface ChatSessionQueryParams {
  sourceType?: string;
  documentId?: string;
  screenshotId?: string;
  audioRecordId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getAllChatSessions = async (query: ChatSessionQueryParams = {}) => {
  const { sourceType, documentId, screenshotId, audioRecordId, search, page = 1, limit = 20 } = query;

  const where: any = {};
  if (sourceType) where.sourceType = sourceType;
  if (documentId) where.documentId = documentId;
  if (screenshotId) where.screenshotId = screenshotId;
  if (audioRecordId) where.audioRecordId = audioRecordId;
  if (search) {
    where.title = { contains: search };
  }

  const skip = (page - 1) * limit;

  const [total, sessions] = await Promise.all([
    prisma.chatSession.count({ where }),
    prisma.chatSession.findMany({
      where,
      include: {
        document: { select: { id: true, title: true } },
        screenshot: { select: { id: true, filename: true } },
        audioRecord: { select: { id: true, filename: true } },
        _count: { select: { messages: true } }
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit
    })
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: sessions
  };
};

export const getChatSessionById = async (id: string) => {
  return prisma.chatSession.findUnique({
    where: { id },
    include: {
      document: true,
      screenshot: true,
      audioRecord: true,
      messages: { orderBy: { createdAt: 'asc' } }
    }
  });
};

export const createChatSession = async (data: {
  title?: string;
  sourceType?: string;
  documentId?: string;
  screenshotId?: string;
  audioRecordId?: string;
}) => {
  return prisma.chatSession.create({
    data: {
      title: data.title || 'New Chat',
      sourceType: data.sourceType || 'GENERAL',
      documentId: data.documentId,
      screenshotId: data.screenshotId,
      audioRecordId: data.audioRecordId
    }
  });
};

export const updateChatSession = async (
  id: string,
  data: Partial<{
    title: string;
    sourceType: string;
    documentId: string | null;
    screenshotId: string | null;
    audioRecordId: string | null;
  }>
) => {
  return prisma.chatSession.update({
    where: { id },
    data
  });
};

export const deleteChatSession = async (id: string) => {
  return prisma.chatSession.delete({
    where: { id }
  });
};

// -------------------------------------------------------------
// Message CRUD Operations
// -------------------------------------------------------------

export const addChatMessage = async (data: {
  chatSessionId: string;
  role: 'USER' | 'ASSISTANT';
  message: string;
  extractedData?: string;
}) => {
  const [msg] = await Promise.all([
    prisma.aiChatHistory.create({ data }),
    prisma.chatSession.update({
      where: { id: data.chatSessionId },
      data: { updatedAt: new Date() }
    })
  ]);
  return msg;
};

export const deleteChatMessage = async (id: string) => {
  return prisma.aiChatHistory.delete({
    where: { id }
  });
};
