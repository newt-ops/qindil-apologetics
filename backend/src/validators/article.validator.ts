import { z } from 'zod';

export const updateArticleSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').optional(),
    slug: z.string().optional(),
    topic: z.string().optional(),
    content: z.any().optional(),
    excerpt: z.string().optional(),
    coverImageUrl: z.string().optional(),
  }),
});

export const submitArticleSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    topic: z.string().optional(),
    content: z.any().optional(),
    excerpt: z.string().optional(),
    coverImageUrl: z.string().optional(),
  }).optional(),
});

export const requestChangesSchema = z.object({
  body: z.object({
    reviewNotes: z
      .string({ required_error: 'Review notes explaining requested changes are required.' })
      .min(5, 'Review notes must be at least 5 characters long.'),
  }),
});

export const createArticleSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required.' })
      .min(2, 'Title must be at least 2 characters long.'),
    topic: z.string().optional(),
    topicId: z.string().optional(),
    authorId: z.string().optional(),
  }),
});

