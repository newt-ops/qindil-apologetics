import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';
import { updateSettingsSchema } from '../validators/settings.validator.js';

const router = Router();

// GET /api/v1/settings — Public read for site footer & tagline
router.get('/', getSettings);

// PATCH /api/v1/settings — Protected SuperAdmin update
router.patch(
  '/',
  protect,
  requireRole('superAdmin'),
  validate(updateSettingsSchema),
  updateSettings
);

export default router;
