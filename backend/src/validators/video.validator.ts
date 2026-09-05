import { z } from 'zod';

export const moveStageSchema = z.object({
  body: z.object({
    stage: z.enum(
      ['idea', 'scripting', 'filming', 'editing', 'review', 'published'],
      { required_error: 'Target board stage is required.' }
    ),
  }),
});

export const updateVideoDetailsSchema = z.object({
  body: z.object({
    posterUrl: z.string().optional(),
    publishedUrl: z.string().optional(),
    notes: z.string().optional(),
  }),
});
