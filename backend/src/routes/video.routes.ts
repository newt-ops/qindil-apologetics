import { Router } from 'express';
import {
  listBoard,
  getVideoById,
  moveStage,
  updateVideoDetails,
} from '../controllers/video.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';
import {
  moveStageSchema,
  updateVideoDetailsSchema,
} from '../validators/video.validator.js';

const router = Router();

// Protect all video production endpoints for admin and superAdmin
router.use(protect);
router.use(requireRole('admin'));

// GET /api/v1/videos/board — List production board videos
router.get('/board', listBoard);

// GET /api/v1/videos/:id — Get video detail by ID
router.get('/:id', getVideoById);

// PATCH /api/v1/videos/:id/stage — Advance or retreat stage (strictly adjacent)
router.patch('/:id/stage', validate(moveStageSchema), moveStage);

// PATCH /api/v1/videos/:id — Update video log details (posterUrl, publishedUrl, notes)
router.patch('/:id', validate(updateVideoDetailsSchema), updateVideoDetails);

export default router;

