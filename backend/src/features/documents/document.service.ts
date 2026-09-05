import { prisma } from '../../utils/prisma';

export interface DocumentQueryParams {
  subjectId?: string;
  fileType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getAllDocuments = async (query: DocumentQueryParams = {}) => {
  const { subjectId, fileType, status, search, page = 1, limit = 20 } = query;

  const where: any = {};
  if (subjectId) where.subjectId = subjectId;
  if (fileType) where.fileType = fileType;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { author: { contains: search } },
      { tags: { contains: search } }
    ];
  }

  const skip = (page - 1) * limit;

  const [total, documents] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.findMany({
      where,
      include: {
        subject: true,
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
      highlights: { orderBy: { createdAt: 'asc' } },
      terms: { orderBy: { createdAt: 'desc' } },
      chatSessions: { orderBy: { updatedAt: 'desc' } }
    }
  });
};

export const createDocument = async (data: {
  subjectId?: string;
  title: string;
  content?: string;
  author?: string;
  publishedYear?: number;
  tags?: string;
  localPath?: string;
  sourceUrl?: string;
  fileType?: string;
  status?: string;
  readingProgress?: string;
}) => {
  return prisma.document.create({
    data
  });
};

export const updateDocument = async (
  id: string,
  data: Partial<{
    subjectId: string | null;
    title: string;
    content: string;
    author: string;
    publishedYear: number;
    tags: string;
    localPath: string;
    sourceUrl: string;
    fileType: string;
    status: string;
    readingProgress: string;
  }>
) => {
  return prisma.document.update({
    where: { id },
    data
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
