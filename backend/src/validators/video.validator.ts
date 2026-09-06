import { z } from 'zod';

export const updateVideoDetailsSchema = z.object({
  body: z.object({
    posterUrl: z.string().optional(),
    submittedUrl: z.string().optional(),
    notes: z.string().optional(),
    videoType: z.enum(['refutation', 'normal']).optional(),
    destination: z.enum(['official', 'personal']).optional(),
    targetVideoUrl: z.string().optional(),
  }),
});

export const submitVideoSchema = z.object({
  body: z.object({
    submittedUrl: z.string().optional(),
  }),
});

export const reviewVideoSchema = z.object({
  body: z.object({
    decision: z.enum(['approve', 'requestChanges']),
    reviewNotes: z.string().optional(),
  }),
});

export const postVideoSchema = z.object({
  body: z.object({
    publishedUrl: z.string().min(1, 'Published URL is required'),
  }),
});

