import { z } from 'zod';

export const createScheduleSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'title is required'),
    description: z.string().optional(),
    icon: z.string().optional(),
    coverImage: z.string().optional(),
    widgets: z.string().optional(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});
