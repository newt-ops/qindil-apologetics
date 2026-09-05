import { Router } from 'express';
import {
  listMyCalendarEvents,
  listEventsAdmin,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/event.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';
import { createEventSchema, updateEventSchema } from '../validators/event.validator.js';

const router = Router();

// Protect all event endpoints with authentication
router.use(protect);

// GET /api/v1/events/mine — Get calendar events for authenticated admin/superAdmin
router.get('/mine', requireRole('admin'), listMyCalendarEvents);

// SuperAdmin Only Management Routes
router.get('/', requireRole('superAdmin'), listEventsAdmin);
router.post('/', requireRole('superAdmin'), validate(createEventSchema), createEvent);
router.patch('/:id', requireRole('superAdmin'), validate(updateEventSchema), updateEvent);
router.delete('/:id', requireRole('superAdmin'), deleteEvent);

export default router;
