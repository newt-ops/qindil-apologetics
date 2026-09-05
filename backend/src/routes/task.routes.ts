import { Router } from 'express';
import {
  getMyTasks,
  getTaskById,
  assignTask,
  listTasks,
  updateTaskStatus,
} from '../controllers/task.controller.js';
import commentRouter from './comment.routes.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';
import { assignTaskSchema, updateTaskStatusSchema } from '../validators/task.validator.js';

const router = Router();

// Protect all task endpoints with authentication
router.use(protect);

// GET /api/v1/tasks/mine — Get current user's assigned tasks (any admin rank)
router.get('/mine', requireRole('admin'), getMyTasks);

// POST /api/v1/tasks — Assign a new task (superAdmin only)
router.post('/', requireRole('superAdmin'), validate(assignTaskSchema), assignTask);

// GET /api/v1/tasks — List all tasks with filters (superAdmin only)
router.get('/', requireRole('superAdmin'), listTasks);

// GET /api/v1/tasks/:id — Get task details by ID
router.get('/:id', requireRole('admin'), getTaskById);

// PATCH /api/v1/tasks/:id/status — Update task status (assignee or superAdmin)
router.patch('/:id/status', requireRole('admin'), validate(updateTaskStatusSchema), updateTaskStatus);

// Nested comments router under /api/v1/tasks/:taskId/comments
router.use('/:taskId/comments', commentRouter);

export default router;
