import { z } from 'zod';

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    parentId: z.string().optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});
