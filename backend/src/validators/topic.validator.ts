import { z } from 'zod';

export const createTopicSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Topic name must be at least 2 characters').max(100, 'Topic name must be under 100 characters'),
    slug: z.string().optional(),
    description: z.string().optional(),
    coverImageUrl: z.string().optional(),
    order: z.number().int().optional(),
  }),
});

export const updateTopicSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    coverImageUrl: z.string().optional(),
    order: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const reorderTopicsSchema = z.object({
  body: z.object({
    orderedIds: z.array(z.string().min(1, 'Invalid topic ID')).min(1, 'orderedIds array cannot be empty'),
  }),
});
