import { Router } from 'express';
import {
  getVideoById,
  acceptVideoTask,
  updateVideoDetails,
  submitVideoTask,
  reviewVideoTask,
  postVideoTask,
} from '../controllers/video.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';
import {
  updateVideoDetailsSchema,
  submitVideoSchema,
  reviewVideoSchema,
  postVideoSchema,
} from '../validators/video.validator.js';

const router = Router();

// Protect all video endpoints for admin and superAdmin
router.use(protect);
router.use(requireRole('admin'));

// GET /api/v1/videos/:id — Get video detail by ID
router.get('/:id', getVideoById);

// PATCH /api/v1/videos/:id/accept — Accept video task & initialize workspace
router.patch('/:id/accept', acceptVideoTask);

// PATCH /api/v1/videos/:id/submit — Submit video task (Creator)
router.patch('/:id/submit', validate(submitVideoSchema), submitVideoTask);

// PATCH /api/v1/videos/:id/review — Review video task (SuperAdmin)
router.patch('/:id/review', requireRole('superAdmin'), validate(reviewVideoSchema), reviewVideoTask);

// PATCH /api/v1/videos/:id/post — Post published video (SuperAdmin)
router.patch('/:id/post', requireRole('superAdmin'), validate(postVideoSchema), postVideoTask);

// PATCH /api/v1/videos/:id — Update video log details (posterUrl, notes, etc.)
router.patch('/:id', validate(updateVideoDetailsSchema), updateVideoDetails);

export default router;
