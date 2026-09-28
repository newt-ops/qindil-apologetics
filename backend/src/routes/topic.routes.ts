import { Router } from 'express';
import {
  listTopicsAdmin,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  reorderTopics,
} from '../controllers/topic.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';
import {
  createTopicSchema,
  updateTopicSchema,
  reorderTopicsSchema,
} from '../validators/topic.validator.js';

const router = Router();

// Protect all topic management endpoints
router.use(protect);

// GET /api/v1/topics — List topics (superAdmin sees all; admin/scholar sees active)
router.get('/', listTopicsAdmin);

// SuperAdmin only endpoints for mutating topics
router.use(requireRole('superAdmin'));

// GET /api/v1/topics/:id — Get single topic
router.get('/:id', getTopicById);

// POST /api/v1/topics — Create topic
router.post('/', validate(createTopicSchema), createTopic);

// PATCH /api/v1/topics/reorder — Bulk reorder topics
router.patch('/reorder', validate(reorderTopicsSchema), reorderTopics);

// PATCH /api/v1/topics/:id — Update topic
router.patch('/:id', validate(updateTopicSchema), updateTopic);

// DELETE /api/v1/topics/:id — Soft-delete / deactivate topic
router.delete('/:id', deleteTopic);

export default router;
