import { Router } from 'express';
import {
  createArticleProposal,
  getMyProposals,
  listAllProposals,
  rejectProposal,
} from '../controllers/articleProposal.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';
import {
  createArticleProposalSchema,
  rejectArticleProposalSchema,
} from '../validators/articleProposal.validator.js';

const router = Router();

// All proposal routes require authentication
router.use(protect);
router.use(requireRole('admin'));

// POST /api/v1/article-proposals — Submit a new article proposal
router.post('/', validate(createArticleProposalSchema), createArticleProposal);

// GET /api/v1/article-proposals/mine — List current user's submitted proposals
router.get('/mine', getMyProposals);

// GET /api/v1/article-proposals — List all proposals for moderation (SuperAdmin only)
router.get('/', requireRole('superAdmin'), listAllProposals);

// PATCH /api/v1/article-proposals/:id/reject — Decline a proposal with feedback (SuperAdmin only)
router.patch(
  '/:id/reject',
  requireRole('superAdmin'),
  validate(rejectArticleProposalSchema),
  rejectProposal
);

export default router;
