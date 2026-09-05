import { z } from 'zod';

export const addCommentSchema = z.object({
  body: z.string().trim().min(1, 'Comment body cannot be empty'),
});

export type AddCommentPayload = z.infer<typeof addCommentSchema>;
