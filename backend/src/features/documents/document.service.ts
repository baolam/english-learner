import { prisma } from '../../utils/prisma';

export interface DocumentQueryParams {
  subjectId?: string;
  studySessionId?: string;
  fileType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const parseTagNames = (tagsInput?: string | string[]): string[] => {
  if (!tagsInput) return [];
  if (Array.isArray(tagsInput)) return tagsInput.map((t) => t.trim()).filter(Boolean);
  return tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
};

export const getAllDocuments = async (query: DocumentQueryParams = {}) => {
  const { subjectId, studySessionId, fileType, status, search, page = 1, limit = 20 } = query;

  const where: any = {};
  if (subjectId) where.subjectId = subjectId;
  if (studySessionId) where.studySessionId = studySessionId;
  if (fileType) where.fileType = fileType;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { author: { contains: search } },
      { tags: { some: { name: { contains: search } } } }
    ];
  }

  const skip = (page - 1) * limit;

  const [total, documents] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.findMany({
      where,
      include: {
        subject: true,
        studySession: { select: { id: true, title: true, category: true } },
        tags: true,
        _count: {
          select: { highlights: true, terms: true, chatSessions: true }
        }
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
    data: documents
  };
};

export const getDocumentById = async (id: string) => {
  return prisma.document.findUnique({
    where: { id },
    include: {
      subject: true,
      studySession: true,
      tags: true,
      highlights: { orderBy: { createdAt: 'asc' } },
      terms: { orderBy: { createdAt: 'desc' } },
      chatSessions: { orderBy: { updatedAt: 'desc' } }
    }
  });
};

export const createDocument = async (data: {
  subjectId?: string;
  studySessionId?: string;
  title: string;
  content?: string;
  author?: string;
  publishedYear?: number;
  tags?: string | string[];
  localPath?: string;
  sourceUrl?: string;
  fileType?: string;
  status?: string;
  readingProgress?: string;
}) => {
  const { tags, ...restData } = data;
  const tagNames = parseTagNames(tags);

  return prisma.document.create({
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
      subject: true,
      studySession: true,
      tags: true
    }
  });
};

export const updateDocument = async (
  id: string,
  data: Partial<{
    subjectId: string | null;
    studySessionId: string | null;
    title: string;
    content: string;
    author: string;
    publishedYear: number;
    tags: string | string[];
    localPath: string;
    sourceUrl: string;
    fileType: string;
    status: string;
    readingProgress: string;
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

  return prisma.document.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      studySession: true,
      tags: true
    }
  });
};

export const deleteDocument = async (id: string) => {
  return prisma.document.delete({
    where: { id }
  });
};

// -------------------------------------------------------------
// Highlight CRUD Operations
// -------------------------------------------------------------

export const getHighlightsByDocumentId = async (documentId: string) => {
  return prisma.highlight.findMany({
    where: { documentId },
    orderBy: { createdAt: 'asc' }
  });
};

export const createHighlight = async (data: {
  documentId: string;
  text: string;
  aiParaphrase?: string;
  aiSummary?: string;
  pageNumber?: string;
}) => {
  return prisma.highlight.create({
    data
  });
};

export const updateHighlight = async (
  id: string,
  data: Partial<{
    text: string;
    aiParaphrase: string;
    aiSummary: string;
    pageNumber: string;
  }>
) => {
  return prisma.highlight.update({
    where: { id },
    data
  });
};

export const deleteHighlight = async (id: string) => {
  return prisma.highlight.delete({
    where: { id }
  });
};
