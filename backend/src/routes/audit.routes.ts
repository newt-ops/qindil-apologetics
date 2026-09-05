import { Router } from 'express';
import { listAuditLog } from '../controllers/audit.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// Protect all audit log endpoints with authentication & superAdmin guard
router.use(protect);
router.use(requireRole('superAdmin'));

router.get('/', listAuditLog);

export default router;
