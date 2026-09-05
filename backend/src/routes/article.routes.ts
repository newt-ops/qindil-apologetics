import { Router } from 'express';
import {
  getMyArticles,
  getArticleForEdit,
  updateArticleDraft,
  submitForReview,
  listReviewQueue,
  requestChanges,
  approveArticle,
  publishArticle,
  archiveArticle,
  createArticleDraft,
  listArticlesAdmin,
  deleteArticleDraft,
} from '../controllers/article.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';
import {
  updateArticleSchema,
  submitArticleSchema,
  requestChangesSchema,
  createArticleSchema,
} from '../validators/article.validator.js';

const router = Router();

// Protect all article authoring/review endpoints
router.use(protect);
router.use(requireRole('admin'));

// GET /api/v1/articles — List articles management table (Role-aware)
router.get('/', listArticlesAdmin);

// POST /api/v1/articles — Create new article draft
router.post('/', validate(createArticleSchema), createArticleDraft);

// GET /api/v1/articles/mine — List current user's articles
router.get('/mine', getMyArticles);

// --- SuperAdmin Only Review Queue Endpoints ---
// GET /api/v1/articles/review-queue — List all articles waiting for review
router.get('/review-queue', requireRole('superAdmin'), listReviewQueue);

// PATCH /api/v1/articles/:id/request-changes — Request changes on article
router.patch(
  '/:id/request-changes',
  requireRole('superAdmin'),
  validate(requestChangesSchema),
  requestChanges
);

// PATCH /api/v1/articles/:id/approve — Approve article
router.patch('/:id/approve', requireRole('superAdmin'), approveArticle);

// PATCH /api/v1/articles/:id/publish — Publish approved article
router.patch('/:id/publish', requireRole('superAdmin'), publishArticle);

// PATCH /api/v1/articles/:id/archive — Archive published article
router.patch('/:id/archive', requireRole('superAdmin'), archiveArticle);

// --- General Authoring & Edit Endpoints ---
// GET /api/v1/articles/:id/edit — Fetch article for editing/reviewing
router.get('/:id/edit', getArticleForEdit);

// PATCH /api/v1/articles/:id/submit — Submit article for review
router.patch('/:id/submit', validate(submitArticleSchema), submitForReview);

// PATCH /api/v1/articles/:id — Update article draft (autosave endpoint)
router.patch('/:id', validate(updateArticleSchema), updateArticleDraft);

// DELETE /api/v1/articles/:id — Delete article draft
router.delete('/:id', deleteArticleDraft);

export default router;


