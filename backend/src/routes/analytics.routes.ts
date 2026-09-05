import { Router } from 'express';
import {
  getOverview,
  getArticlesOverTime,
  getTeamActivity,
} from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// All analytics endpoints require authentication and SuperAdmin role
router.use(protect);
router.use(requireRole('superAdmin'));

router.get('/overview', getOverview);
router.get('/articles-over-time', getArticlesOverTime);
router.get('/team-activity', getTeamActivity);

export default router;
