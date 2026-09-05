import { Router } from 'express';
import {
  listContactMessages,
  getContactMessage,
  archiveContactMessage,
} from '../controllers/contact.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// Protect all contact inbox endpoints with authentication & superAdmin guard
router.use(protect);
router.use(requireRole('superAdmin'));

router.get('/', listContactMessages);
router.get('/:id', getContactMessage);
router.patch('/:id/archive', archiveContactMessage);

export default router;
