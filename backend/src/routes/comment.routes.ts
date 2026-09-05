import { Router } from 'express';
import { listComments, addComment } from '../controllers/comment.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';
import { addCommentSchema } from '../validators/comment.validator.js';

const router = Router({ mergeParams: true });

// Protect all comment endpoints for admin ranks
router.use(protect);
router.use(requireRole('admin'));

// GET /api/v1/tasks/:taskId/comments — List comments for task
router.get('/', listComments);

// POST /api/v1/tasks/:taskId/comments — Add a comment to task
router.post('/', validate(addCommentSchema), addComment);

export default router;
