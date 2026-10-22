import { z } from 'zod';

export const soundUploadSchema = z.object({
  body: z.object({
    text: z.string().optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});
