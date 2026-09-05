import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatarUrl: z.string().url('Avatar must be a valid URL').or(z.literal('')).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
