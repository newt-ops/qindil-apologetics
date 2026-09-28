import { z } from 'zod';

export const createTopicSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Topic name is required' })
      .trim()
      .min(2, 'Topic name must be at least 2 characters')
      .max(100, 'Topic name must be under 100 characters'),
    slug: z.string().trim().nullable().optional(),
    description: z.string().trim().nullable().optional(),
    coverImageUrl: z.string().trim().nullable().optional(),
    order: z.number().int().nullable().optional(),
  }),
});

export const updateTopicSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Topic name must be at least 2 characters')
      .max(100, 'Topic name must be under 100 characters')
      .optional(),
    slug: z.string().trim().nullable().optional(),
    description: z.string().trim().nullable().optional(),
    coverImageUrl: z.string().trim().nullable().optional(),
    order: z.number().int().nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const reorderTopicsSchema = z.object({
  body: z.object({
    orderedIds: z.array(z.string().min(1, 'Invalid topic ID')).min(1, 'orderedIds array cannot be empty'),
  }),
});

