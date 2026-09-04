import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllTodos = async () => {
  return prisma.todo.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const getTodoById = async (id: string) => {
  return prisma.todo.findUnique({
    where: { id }
  });
};

export const createTodo = async (data: { title: string; description?: string }) => {
  return prisma.todo.create({
    data
  });
};

export const updateTodo = async (id: string, data: { title?: string; description?: string; isCompleted?: boolean }) => {
  return prisma.todo.update({
    where: { id },
    data
  });
};

export const deleteTodo = async (id: string) => {
  return prisma.todo.delete({
    where: { id }
  });
};
