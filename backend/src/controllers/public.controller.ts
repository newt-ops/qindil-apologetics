import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { ArticleModel } from '../models/Article.model.js';
import { TopicModel } from '../models/Topic.model.js';
import { ContactMessageModel } from '../models/ContactMessage.model.js';
import { EventModel } from '../models/Event.model.js';
import { sendContactAutoReply } from '../services/email/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';

// @desc    Get recent published featured articles for public home page
// @route   GET /api/v1/public/articles/featured
export const getFeaturedArticles = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const articles = await ArticleModel.find({ status: 'published' })
      .select('title slug excerpt coverImageUrl publishedAt topic author viewCount')
      .populate('topic', 'name slug')
      .populate('author', 'name avatarUrl')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(6)
      .lean();

    sendSuccess(res, articles);
  }
);

// @desc    Get active topics for public navigation & previews
// @route   GET /api/v1/public/topics
export const getActiveTopics = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const topics = await TopicModel.find({ isActive: true })
      .select('name slug description coverImageUrl order')
      .sort({ order: 1, name: 1 })
      .lean();

    sendSuccess(res, topics);
  }
);

// @desc    Get paginated published articles with optional topic filtering
// @route   GET /api/v1/public/articles
export const listArticles = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 9));
    const topicSlug = (req.query.topic as string) || '';
    const search = (req.query.search as string || '').trim();

    const filter: Record<string, any> = { status: 'published' };
    let topicDoc: any = null;

    if (search) {
      filter.$text = { $search: search };
    }

    if (topicSlug) {
      topicDoc = await TopicModel.findOne({ slug: topicSlug, isActive: true }).lean();
      if (topicDoc) {
        filter.topic = topicDoc._id;
      } else {
        // Topic slug provided but not found -> return empty list
        sendSuccess(res, {
          articles: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
          topic: null,
        });
        return;
      }
    }

    const total = await ArticleModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    const articles = await ArticleModel.find(filter)
      .select('title slug excerpt coverImageUrl publishedAt topic author viewCount')
      .populate('topic', 'name slug')
      .populate('author', 'name avatarUrl')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    sendSuccess(res, {
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      topic: topicDoc
        ? {
            _id: topicDoc._id,
            name: topicDoc.name,
            slug: topicDoc.slug,
            description: topicDoc.description,
            coverImageUrl: topicDoc.coverImageUrl,
          }
        : null,
    });
  }
);

// @desc    Get single published article by slug (Public boundary check: strictly status === 'published')
// @route   GET /api/v1/public/articles/:slug
export const getArticleBySlug = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { slug } = req.params;

    const article = await ArticleModel.findOne({ slug, status: 'published' })
      .select('title slug excerpt content coverImageUrl publishedAt viewCount topic author')
      .populate('topic', 'name slug description')
      .populate('author', 'name avatarUrl')
      .lean();

    if (!article) {
      return next(ApiError.notFound('Article not found', 'NOT_FOUND'));
    }

    sendSuccess(res, article);
  }
);

// @desc    Increment article view count atomically
// @route   PATCH /api/v1/public/articles/:slug/view
export const incrementViewCount = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { slug } = req.params;

    const article = await ArticleModel.findOneAndUpdate(
      { slug, status: 'published' },
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .select('viewCount')
      .lean();

    if (!article) {
      return next(ApiError.notFound('Article not found', 'NOT_FOUND'));
    }

    sendSuccess(res, { viewCount: article.viewCount });
  }
);

// @desc    Submit a contact message from public visitor
// @route   POST /api/v1/public/contact
export const submitContactMessage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, subject, message } = req.body;

    const contactDoc = await ContactMessageModel.create({
      name,
      email,
      subject,
      message,
      status: 'new',
    });

    // Trigger email auto-reply
    await sendContactAutoReply(name, email);

    sendSuccess(
      res,
      {
        message: 'Thank you for reaching out! Your message has been received.',
        id: contactDoc._id,
      },
      undefined,
      201
    );
  }
);

// @desc    List upcoming public events
// @route   GET /api/v1/public/events
export const listPublicEvents = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const includePast = req.query.includePast === 'true';

    const filter: Record<string, any> = { visibility: 'public' };

    if (!includePast) {
      filter.startDate = { $gte: new Date() };
    }

    const events = await EventModel.find(filter)
      .select('title description startDate endDate allDay location')
      .sort({ startDate: 1 })
      .lean();

    sendSuccess(res, events);
  }
);

// @desc    Generate dynamic XML sitemap
// @route   GET /sitemap.xml
export const getSitemap = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const baseUrl = (env.CLIENT_URL || 'http://localhost:3000').replace(/\/+$/, '');

    const staticRoutes = [
      '',
      '/topics',
      '/articles',
      '/events',
      '/about',
      '/contact',
      '/privacy',
      '/terms',
    ];

    const publishedArticles = await ArticleModel.find({ status: 'published' })
      .select('slug updatedAt')
      .lean();

    const staticUrlsXml = staticRoutes
      .map(
        (route) => `  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`
      )
      .join('\n');

    const articleUrlsXml = publishedArticles
      .map(
        (art) => `  <url>
    <loc>${baseUrl}/articles/${art.slug}</loc>
    <lastmod>${new Date(art.updatedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
      )
      .join('\n');

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrlsXml}
${articleUrlsXml}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xmlContent);
  }
);

// @desc    Serve robots.txt
// @route   GET /robots.txt
export const getRobotsTxt = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const baseUrl = (env.CLIENT_URL || 'http://localhost:3000').replace(/\/+$/, '');

    const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;

    res.header('Content-Type', 'text/plain');
    res.status(200).send(content);
  }
);

