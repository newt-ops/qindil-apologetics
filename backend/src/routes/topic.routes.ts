import { Router } from 'express';
import {
  listTopicsAdmin,
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

// Protect all topic management endpoints for SuperAdmin only
router.use(protect);
router.use(requireRole('superAdmin'));

// GET /api/v1/topics — List all topics (including inactive)
router.get('/', listTopicsAdmin);

// POST /api/v1/topics — Create topic
router.post('/', validate(createTopicSchema), createTopic);

// PATCH /api/v1/topics/reorder — Bulk reorder topics
router.patch('/reorder', validate(reorderTopicsSchema), reorderTopics);

// PATCH /api/v1/topics/:id — Update topic
router.patch('/:id', validate(updateTopicSchema), updateTopic);

// DELETE /api/v1/topics/:id — Soft-delete / deactivate topic
router.delete('/:id', deleteTopic);

export default router;
