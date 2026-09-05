import { Router } from 'express';
import {
  getFeaturedArticles,
  getActiveTopics,
  listArticles,
  getArticleBySlug,
  incrementViewCount,
  submitContactMessage,
  listPublicEvents,
} from '../controllers/public.controller.js';
import { validate } from '../middleware/validate.js';
import { contactSchema } from '../validators/contact.validator.js';
import { contactLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/articles/featured', getFeaturedArticles);
router.get('/topics', getActiveTopics);
router.get('/articles', listArticles);
router.get('/articles/:slug', getArticleBySlug);
router.patch('/articles/:slug/view', incrementViewCount);
router.post('/contact', contactLimiter, validate(contactSchema), submitContactMessage);
router.get('/events', listPublicEvents);

export default router;
