import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/me.validator.js';
import {
  getMyNotifications,
  markNotificationRead,
  updateMyProfile,
  generateTelegramLinkCode,
  unlinkTelegram,
} from '../controllers/me.controller.js';

const router = Router();

// All /me routes require authentication
router.use(protect);

router.get('/notifications', getMyNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.patch('/profile', validate(updateProfileSchema), updateMyProfile);
router.post('/telegram/generate-code', generateTelegramLinkCode);
router.delete('/telegram', unlinkTelegram);

export default router;

