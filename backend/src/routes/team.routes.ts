import { Router } from 'express';
import {
  listTeam,
  getTeamMember,
  updateMemberRole,
  updateMemberStatus,
} from '../controllers/team.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';
import { updateRoleSchema, updateStatusSchema } from '../validators/team.validator.js';

const router = Router();

// Require authentication and SuperAdmin role for all team management endpoints
router.use(protect);
router.use(requireRole('superAdmin'));

// GET /api/v1/team — List team members
router.get('/', listTeam);

// GET /api/v1/team/:id — Get member profile
router.get('/:id', getTeamMember);

// PATCH /api/v1/team/:id/role — Update member role (user, admin, superAdmin)
router.patch('/:id/role', validate(updateRoleSchema), updateMemberRole);

// PATCH /api/v1/team/:id/status — Deactivate or reactivate member
router.patch('/:id/status', validate(updateStatusSchema), updateMemberStatus);

export default router;
