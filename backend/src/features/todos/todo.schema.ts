import { z } from 'zod';

export const createTodoSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    scheduleId: z.string().optional(),
    parentId: z.string().optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});
