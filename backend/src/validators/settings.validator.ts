import { z } from 'zod';

export const updateSettingsSchema = z.object({
  siteName: z.string().min(2, 'Site name must be at least 2 characters long').optional(),
  tagline: z.string().optional(),
  contactEmail: z.string().email('Invalid contact email address').optional().or(z.literal('')),
  socialLinks: z
    .object({
      facebook: z.string().optional(),
      youtube: z.string().optional(),
      telegram: z.string().optional(),
      instagram: z.string().optional(),
      tiktok: z.string().optional(),
    })
    .optional(),
  maintenanceMode: z.boolean().optional(),
});

export type UpdateSettingsPayload = z.infer<typeof updateSettingsSchema>;
