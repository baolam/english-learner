import { prisma } from '../../utils/prisma';

export const getAllSubjects = async (query?: { parentId?: string | null; search?: string }) => {
  const where: any = {};
  if (query?.parentId !== undefined) {
    where.parentId = query.parentId === 'null' || query.parentId === null ? null : query.parentId;
  }
  if (query?.search) {
    where.name = { contains: query.search };
  }

  return prisma.subject.findMany({
    where,
    include: {
      subSubjects: true,
      _count: {
        select: { documents: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getSubjectById = async (id: string) => {
  return prisma.subject.findUnique({
    where: { id },
    include: {
      subSubjects: true,
      documents: true,
      parent: true
    }
  });
};

export const createSubject = async (data: { name: string; description?: string; parentId?: string }) => {
  return prisma.subject.create({
    data
  });
};

export const updateSubject = async (id: string, data: { name?: string; description?: string; parentId?: string | null }) => {
  return prisma.subject.update({
    where: { id },
    data
  });
};

export const deleteSubject = async (id: string) => {
  return prisma.subject.delete({
    where: { id }
  });
};
