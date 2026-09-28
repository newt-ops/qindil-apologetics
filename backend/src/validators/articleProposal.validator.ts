import { z } from 'zod';

export const createArticleProposalSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(3, 'Title must be at least 3 characters long')
      .max(200, 'Title cannot exceed 200 characters'),
    topic: z.string().optional(),
    summary: z
      .string({ required_error: 'Summary/thesis is required' })
      .trim()
      .min(10, 'Summary must be at least 10 characters long')
      .max(3000, 'Summary cannot exceed 3000 characters'),
    proposedDueDate: z.string().optional(),
  }),
});

export const rejectArticleProposalSchema = z.object({
  body: z.object({
    adminFeedback: z
      .string({ required_error: 'Feedback explanation is required' })
      .trim()
      .min(3, 'Feedback must be at least 3 characters long'),
  }),
});
