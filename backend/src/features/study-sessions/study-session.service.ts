import { prisma } from '../../utils/prisma';

export interface StudySessionQueryParams {
  category?: string;
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

export const getAllStudySessions = async (query: StudySessionQueryParams = {}) => {
  const { category, status, search, page = 1, limit = 20 } = query;

  const where: any = {};
  if (category) where.category = category;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { aiSummary: { contains: search } },
      { tags: { some: { name: { contains: search } } } }
    ];
  }

  const skip = (page - 1) * limit;

  const [total, sessions] = await Promise.all([
    prisma.studySession.count({ where }),
    prisma.studySession.findMany({
      where,
      include: {
        tags: true,
        _count: {
          select: {
            documents: true,
            terms: true,
            screenshots: true,
            audioRecords: true,
            conceptRelations: true,
            chatSessions: true
          }
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
    data: sessions
  };
};

export const getStudySessionById = async (id: string) => {
  return prisma.studySession.findUnique({
    where: { id },
    include: {
      tags: true,
      documents: { orderBy: { createdAt: 'desc' } },
      terms: { orderBy: { createdAt: 'desc' }, include: { flashcard: true } },
      screenshots: { orderBy: { capturedAt: 'desc' } },
      audioRecords: { orderBy: { capturedAt: 'desc' } },
      chatSessions: { orderBy: { updatedAt: 'desc' } },
      conceptRelations: {
        include: {
          sourceTerm: true,
          targetTerm: true
        }
      }
    }
  });
};

export const createStudySession = async (data: {
  title?: string;
  category?: string;
  status?: string;
  aiSummary?: string;
  startedAt?: Date | string;
  endedAt?: Date | string;
  tags?: string | string[];
}) => {
  const { tags, ...restData } = data;
  const tagNames = parseTagNames(tags);

  return prisma.studySession.create({
    data: {
      ...restData,
      title: restData.title || 'Untitled Session',
      tags: tagNames.length > 0 ? {
        connectOrCreate: tagNames.map((name) => ({
          where: { name },
          create: { name }
        }))
      } : undefined
    },
    include: {
      tags: true
    }
  });
};

export const updateStudySession = async (
  id: string,
  data: Partial<{
    title: string;
    category: string;
    status: string;
    aiSummary: string;
    startedAt: Date | string;
    endedAt: Date | string | null;
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

  return prisma.studySession.update({
    where: { id },
    data: updateData,
    include: {
      tags: true
    }
  });
};

export const deleteStudySession = async (id: string) => {
  return prisma.studySession.delete({
    where: { id }
  });
};

// -------------------------------------------------------------
// Concept Relation Operations
// -------------------------------------------------------------

export const getConceptRelationsBySession = async (sessionId: string) => {
  return prisma.conceptRelation.findMany({
    where: { sessionId },
    include: {
      sourceTerm: true,
      targetTerm: true
    }
  });
};

export const addConceptRelation = async (data: {
  sessionId: string;
  sourceTermId: string;
  targetTermId: string;
  relationType?: string;
}) => {
  return prisma.conceptRelation.create({
    data: {
      sessionId: data.sessionId,
      sourceTermId: data.sourceTermId,
      targetTermId: data.targetTermId,
      relationType: data.relationType || 'RELATED_TO'
    },
    include: {
      sourceTerm: true,
      targetTerm: true
    }
  });
};

export const deleteConceptRelation = async (id: string) => {
  return prisma.conceptRelation.delete({
    where: { id }
  });
};
