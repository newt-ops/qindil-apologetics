import { z } from 'zod';

export const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin', 'superAdmin'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be one of: user, admin, superAdmin',
  }),
});

export const updateStatusSchema = z.object({
  isActive: z.boolean({
    required_error: 'isActive status is required',
  }),
});

export type UpdateRolePayload = z.infer<typeof updateRoleSchema>;
export type UpdateStatusPayload = z.infer<typeof updateStatusSchema>;
