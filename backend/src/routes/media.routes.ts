import { Router } from 'express';
import { getUploadSignature } from '../controllers/media.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// Protect all media endpoints for admin ranks
router.use(protect);
router.use(requireRole('admin'));

// POST /api/v1/media/sign — Generate Cloudinary upload signature
router.post('/sign', getUploadSignature);

export default router;
