import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import ArticleModel from '../models/Article.model.js';
import UserModel from '../models/User.model.js';
import TaskModel from '../models/Task.model.js';
import AuditLogModel from '../models/AuditLog.model.js';
import { createNotification } from '../services/notify.js';
import { sendTelegramTaskProgressNotification } from '../telegram/index.js';
import { sendArticleReviewOutcomeEmail } from '../services/email/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// @desc    Get current user's articles (My Articles list)
// @route   GET /api/v1/articles/mine
// @access  Private (Admin & SuperAdmin)
export const getMyArticles = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!._id;

    const articles = await ArticleModel.find({ author: userId })
      .populate('topic', 'name slug')
      .populate('author', 'name email avatarUrl')
      .sort({ updatedAt: -1 });

    sendSuccess(res, articles);
  }
);

// @desc    Get article details for editing (author or superAdmin)
// @route   GET /api/v1/articles/:id/edit
// @access  Private (Admin & SuperAdmin)
export const getArticleForEdit = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const callerId = req.user!._id.toString();
    const isSuperAdmin = req.user!.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    const article = await ArticleModel.findById(id)
      .populate('topic', 'name slug')
      .populate('author', 'name email avatarUrl')
      .populate('lastEditedBy', 'name email avatarUrl');

    if (!article) {
      return next(ApiError.notFound('Article not found', 'NOT_FOUND'));
    }

    const isAuthor = article.author._id.toString() === callerId;

    if (!isAuthor && !isSuperAdmin) {
      return next(
        ApiError.forbidden('You do not have permission to view or edit this article.', 'FORBIDDEN')
      );
    }

    sendSuccess(res, article);
  }
);

// @desc    Update article draft (title, topic, content, excerpt, coverImageUrl)
// @route   PATCH /api/v1/articles/:id
// @access  Private (Admin & SuperAdmin)
export const updateArticleDraft = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const callerId = req.user!._id.toString();
    const isSuperAdmin = req.user!.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    const article = await ArticleModel.findById(id);
    if (!article) {
      return next(ApiError.notFound('Article not found', 'NOT_FOUND'));
    }

    const isAuthor = article.author.toString() === callerId;
    if (!isAuthor && !isSuperAdmin) {
      return next(
        ApiError.forbidden('You do not have permission to edit this article.', 'FORBIDDEN')
      );
    }

    // Authors cannot edit while status is 'inReview' (under SuperAdmin review). SuperAdmin can edit at any status.
    if (!isSuperAdmin && article.status === 'inReview') {
      return next(
        ApiError.forbidden(
          `Cannot edit article while status is "${article.status}".`,
          'EDIT_LOCKED'
        )
      );
    }

    const { title, topic, content, excerpt, coverImageUrl, slug: inputSlug } = req.body;

    if (title !== undefined) article.title = title;
    if (topic !== undefined) article.topic = topic || undefined;
    if (excerpt !== undefined) article.excerpt = excerpt;
    if (coverImageUrl !== undefined) article.coverImageUrl = coverImageUrl;

    // Stringify content if object
    if (content !== undefined) {
      article.content = typeof content === 'object' ? JSON.stringify(content) : content;
    }

    // Slug calculation & uniqueness check
    if (inputSlug) {
      const newSlug = slugify(inputSlug);
      if (newSlug !== article.slug) {
        const slugExists = await ArticleModel.findOne({ slug: newSlug, _id: { $ne: id } });
        if (slugExists) {
          article.slug = `${newSlug}-${Date.now().toString().slice(-4)}`;
        } else {
          article.slug = newSlug;
        }
      }
    } else if (title && !article.slug) {
      const newSlug = slugify(title);
      const slugExists = await ArticleModel.findOne({ slug: newSlug, _id: { $ne: id } });
      if (slugExists) {
        article.slug = `${newSlug}-${Date.now().toString().slice(-4)}`;
      } else {
        article.slug = newSlug;
      }
    }

    // Always record lastEditedBy without modifying author
    article.lastEditedBy = req.user!._id;

    await article.save();

    const populated = await ArticleModel.findById(article._id)
      .populate('topic', 'name slug')
      .populate('author', 'name email avatarUrl')
      .populate('lastEditedBy', 'name email avatarUrl');

    // Write audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'article.updateDraft',
      targetModel: 'Article',
      targetId: article._id,
      details: { title: article.title, status: article.status, lastEditedBy: req.user!._id },
    });

    sendSuccess(res, populated || article);
  }
);

// @desc    Fast autosave for article drafts (author only, no audit log)
// @route   PATCH /api/v1/articles/:id/autosave
// @access  Private (Author only)
export const autosaveArticle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const callerId = req.user!._id.toString();
    const isSuperAdmin = req.user!.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    const article = await ArticleModel.findById(id);

    if (!article) {
      return next(ApiError.notFound('Article not found', 'NOT_FOUND'));
    }

    const isAuthor = article.author.toString() === callerId;
    if (!isAuthor && !isSuperAdmin) {
      return next(
        ApiError.forbidden('Only the author or superAdmin can autosave this draft.', 'FORBIDDEN')
      );
    }

    if (!isSuperAdmin && article.status === 'inReview') {
      return next(
        ApiError.forbidden(
          `Cannot autosave article while status is "${article.status}".`,
          'INVALID_STATUS'
        )
      );
    }

    const { title, topic, content, excerpt, coverImageUrl, slug: inputSlug } = req.body || {};

    if (title !== undefined) {
      article.title = title;
      if (article.linkedTaskId && title.trim()) {
        await TaskModel.findByIdAndUpdate(article.linkedTaskId, { $set: { title: title.trim() } });
      }
    }
    if (topic !== undefined) article.topic = topic || undefined;
    if (excerpt !== undefined) article.excerpt = excerpt;
    if (coverImageUrl !== undefined) article.coverImageUrl = coverImageUrl;
    if (content !== undefined) {
      article.content = typeof content === 'object' ? JSON.stringify(content) : content;
    }

    if (inputSlug && inputSlug.trim()) {
      article.slug = slugify(inputSlug);
    } else if (!article.slug && article.title?.trim()) {
      article.slug = slugify(article.title);
    }

    article.lastAutosavedAt = new Date();
    article.lastEditedBy = req.user!._id;
    await article.save();

    const populated = await ArticleModel.findById(article._id)
      .populate('topic', 'name slug')
      .populate('author', 'name email avatarUrl')
      .populate('lastEditedBy', 'name email avatarUrl');

    sendSuccess(res, populated || article);
  }
);

// @desc    Submit article for SuperAdmin review
// @route   PATCH /api/v1/articles/:id/submit
// @access  Private (Admin & SuperAdmin)
export const submitForReview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const callerId = req.user!._id.toString();
    const isSuperAdmin = req.user!.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    const article = await ArticleModel.findById(id);
    if (!article) {
      return next(ApiError.notFound('Article not found', 'NOT_FOUND'));
    }

    const isAuthor = article.author.toString() === callerId;
    if (!isAuthor && !isSuperAdmin) {
      return next(
        ApiError.forbidden('You do not have permission to submit this article.', 'FORBIDDEN')
      );
    }

    if (article.status !== 'draft' && article.status !== 'changesRequested') {
      return next(
        ApiError.forbidden(
          `Cannot submit article while status is "${article.status}".`,
          'INVALID_STATUS'
        )
      );
    }

    // Optional inline update before submission
    const { title, topic, content, excerpt, coverImageUrl, slug: inputSlug } = req.body || {};

    if (title !== undefined) article.title = title;
    if (topic !== undefined) article.topic = topic || undefined;
    if (excerpt !== undefined) article.excerpt = excerpt;
    if (coverImageUrl !== undefined) article.coverImageUrl = coverImageUrl;
    if (content !== undefined) {
      article.content = typeof content === 'object' ? JSON.stringify(content) : content;
    }

    // Validate all required metadata fields before allowing transition
    const finalTitle = article.title?.trim();
    const finalContent = article.content?.trim();
    const finalTopic = article.topic;
    const finalExcerpt = article.excerpt?.trim();
    const finalCover = article.coverImageUrl?.trim();

    if (!finalTitle || !finalContent || !finalTopic || !finalExcerpt || !finalCover) {
      return next(
        ApiError.badRequest(
          'All metadata fields (Title, Topic Category, Excerpt/Summary, Cover Image, and Content) are required before submitting for review.',
          'INCOMPLETE_ARTICLE_METADATA'
        )
      );
    }

    // Generate slug if not present
    if (!article.slug) {
      let generatedSlug = inputSlug ? slugify(inputSlug) : slugify(finalTitle);
      const slugExists = await ArticleModel.findOne({ slug: generatedSlug, _id: { $ne: id } });
      if (slugExists) {
        generatedSlug = `${generatedSlug}-${Date.now().toString().slice(-4)}`;
      }
      article.slug = generatedSlug;
    }

    article.status = 'inReview';
    await article.save();

    // Also update linked Task status to 'inReview'
    if (article.linkedTaskId) {
      await TaskModel.findByIdAndUpdate(article.linkedTaskId, { $set: { status: 'inReview' } });
    }

    // Trigger notification to every SuperAdmin
    const superAdmins = await UserModel.find({ isActive: true }).populate('roles');
    const superAdminUsers = superAdmins.filter((u) =>
      u.roles.some((r: any) => (typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'))
    );

    for (const sa of superAdminUsers) {
      await createNotification({
        recipient: sa._id as any,
        type: 'review_requested',
        title: 'Article Submitted for Review',
        body: `"${article.title}" by ${req.user!.name} has been submitted for review.`,
        link: '/admin/review-queue',
      });
    }

    // Write audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'article.submitForReview',
      targetModel: 'Article',
      targetId: article._id,
      details: { title: article.title, author: article.author },
    });

    sendSuccess(res, article);
  }
);

// @desc    List articles in review queue (SuperAdmin only)
// @route   GET /api/v1/articles/review-queue
// @access  Private (SuperAdmin only)
export const listReviewQueue = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const articles = await ArticleModel.find({ status: 'inReview' })
      .populate('topic', 'name slug')
      .populate('author', 'name email avatarUrl')
      .populate('lastEditedBy', 'name email avatarUrl')
      .sort({ createdAt: 1 }); // Oldest submitted first

    sendSuccess(res, articles);
  }
);

// @desc    Review article decision (approve, requestChanges, or publish)
// @route   PATCH /api/v1/articles/:id/review
// @access  Private (SuperAdmin only)
export const reviewArticle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { decision, reviewNotes } = req.body;

    if (!['approve', 'requestChanges', 'publish'].includes(decision)) {
      return next(
        ApiError.badRequest(
          'Invalid review decision. Must be "approve", "requestChanges", or "publish".',
          'INVALID_DECISION'
        )
      );
    }

    if (decision === 'requestChanges' && (!reviewNotes || !reviewNotes.trim())) {
      return next(
        ApiError.badRequest(
          'Review notes explaining requested changes are required.',
          'MISSING_REVIEW_NOTES'
        )
      );
    }

    const article = await ArticleModel.findById(id)
      .populate('topic', 'name slug')
      .populate('author', 'name email avatarUrl')
      .populate('lastEditedBy', 'name email avatarUrl');

    if (!article) {
      return next(ApiError.notFound('Article not found', 'NOT_FOUND'));
    }

    const authorId = typeof article.author === 'object' ? (article.author as any)._id : article.author;
    const authorEmail = typeof article.author === 'object' ? (article.author as any).email : undefined;

    if (decision === 'requestChanges') {
      if (article.status !== 'inReview') {
        return next(
          ApiError.badRequest(
            `Cannot request changes on article with status "${article.status}".`,
            'INVALID_STATUS'
          )
        );
      }

      article.status = 'changesRequested';
      article.reviewNotes = reviewNotes.trim();
      article.lastEditedBy = req.user!._id;
      await article.save();

      // Kick linked task back to inProgress
      if (article.linkedTaskId) {
        await TaskModel.findByIdAndUpdate(article.linkedTaskId, { $set: { status: 'inProgress' } });
      }

      // Notify author via bell, telegram, and email
      await createNotification({
        recipient: authorId,
        type: 'changes_requested',
        title: 'Changes Requested on Article',
        body: `Reviewer notes for "${article.title}": ${reviewNotes.trim()}`,
        link: `/admin/articles/${article._id}/edit`,
      });

      await sendTelegramTaskProgressNotification(
        authorId,
        article.title,
        'changes_requested',
        reviewNotes.trim()
      );

      if (authorEmail) {
        await sendArticleReviewOutcomeEmail(
          authorEmail,
          article.title,
          'changesRequested',
          reviewNotes.trim()
        );
      }
    } else if (decision === 'approve') {
      if (article.status !== 'inReview') {
        return next(
          ApiError.badRequest(
            `Cannot approve article with status "${article.status}".`,
            'INVALID_STATUS'
          )
        );
      }

      article.status = 'approved';
      if (reviewNotes) article.reviewNotes = reviewNotes.trim();
      article.lastEditedBy = req.user!._id;
      await article.save();

      await createNotification({
        recipient: authorId,
        type: 'article_approved',
        title: 'Article Approved',
        body: `Your article "${article.title}" has been approved!`,
        link: `/admin/articles/${article._id}/edit`,
      });

      await sendTelegramTaskProgressNotification(authorId, article.title, 'approved');

      if (authorEmail) {
        await sendArticleReviewOutcomeEmail(authorEmail, article.title, 'approved', reviewNotes);
      }
    } else if (decision === 'publish') {
      if (article.status !== 'inReview' && article.status !== 'approved') {
        return next(
          ApiError.badRequest(
            `Cannot publish article with status "${article.status}". Must be "inReview" or "approved".`,
            'INVALID_STATUS'
          )
        );
      }

      article.status = 'published';
      if (!article.publishedAt) {
        article.publishedAt = new Date();
      }
      if (reviewNotes) article.reviewNotes = reviewNotes.trim();
      article.lastEditedBy = req.user!._id;

      // Finalize slug if missing
      if (!article.slug && article.title) {
        let genSlug = slugify(article.title);
        const slugExists = await ArticleModel.findOne({ slug: genSlug, _id: { $ne: article._id } });
        if (slugExists) {
          genSlug = `${genSlug}-${Date.now().toString().slice(-4)}`;
        }
        article.slug = genSlug;
      }

      await article.save();

      // Update linked task to done
      if (article.linkedTaskId) {
        await TaskModel.findByIdAndUpdate(article.linkedTaskId, { $set: { status: 'done' } });
      }

      await createNotification({
        recipient: authorId,
        type: 'article_published',
        title: 'Article Published',
        body: `Your article "${article.title}" is now published and live on Qindil!`,
        link: `/articles/${article.slug}`,
      });

      await sendTelegramTaskProgressNotification(authorId, article.title, 'published');

      if (authorEmail) {
        await sendArticleReviewOutcomeEmail(authorEmail, article.title, 'published');
      }
    }

    // Write audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: `article.review.${decision}`,
      targetModel: 'Article',
      targetId: article._id,
      details: { title: article.title, decision, reviewNotes: reviewNotes || '' },
    });

    const updatedArticle = await ArticleModel.findById(id)
      .populate('topic', 'name slug')
      .populate('author', 'name email avatarUrl')
      .populate('lastEditedBy', 'name email avatarUrl');

    sendSuccess(res, updatedArticle || article);
  }
);

// @desc    Request changes on submitted article (SuperAdmin only)
// @route   PATCH /api/v1/articles/:id/request-changes
// @access  Private (SuperAdmin only)
export const requestChanges = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { reviewNotes } = req.body;

    const article = await ArticleModel.findById(id)
      .populate('topic', 'name slug')
      .populate('author', 'name email avatarUrl');

    if (!article) {
      return next(ApiError.notFound('Article not found', 'NOT_FOUND'));
    }

    if (article.status !== 'inReview') {
      return next(
        ApiError.badRequest(
          `Cannot request changes on article with status "${article.status}".`,
          'INVALID_STATUS'
        )
      );
    }

    article.status = 'changesRequested';
    article.reviewNotes = reviewNotes;
    await article.save();

    // Notify author
    const authorId = typeof article.author === 'object' ? (article.author as any)._id : article.author;
    const authorEmail = typeof article.author === 'object' ? (article.author as any).email : undefined;

    await createNotification({
      recipient: authorId,
      type: 'changes_requested',
      title: 'Changes Requested on Article',
      body: `Reviewer notes for "${article.title}": ${reviewNotes}`,
      link: `/admin/articles/${article._id}/edit`,
    });

    await sendTelegramTaskProgressNotification(
      authorId,
      article.title,
      'changes_requested',
      reviewNotes
    );

    if (authorEmail) {
      await sendArticleReviewOutcomeEmail(
        authorEmail,
        article.title,
        'changesRequested',
        reviewNotes
      );
    }

    // Write audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'article.requestChanges',
      targetModel: 'Article',
      targetId: article._id,
      details: { title: article.title, reviewNotes },
    });

    sendSuccess(res, article);
  }
);

// @desc    Approve submitted article (SuperAdmin only)
// @route   PATCH /api/v1/articles/:id/approve
// @access  Private (SuperAdmin only)
export const approveArticle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const article = await ArticleModel.findById(id)
      .populate('topic', 'name slug')
      .populate('author', 'name email avatarUrl');

    if (!article) {
      return next(ApiError.notFound('Article not found', 'NOT_FOUND'));
    }

    if (article.status !== 'inReview') {
      return next(
        ApiError.badRequest(
          `Cannot approve article with status "${article.status}".`,
          'INVALID_STATUS'
        )
      );
    }

    article.status = 'approved';
    await article.save();

    // Notify author
    const authorId = typeof article.author === 'object' ? (article.author as any)._id : article.author;
    const authorEmail = typeof article.author === 'object' ? (article.author as any).email : undefined;

    await createNotification({
      recipient: authorId,
      type: 'article_approved',
      title: 'Article Approved',
      body: `Your article "${article.title}" has been approved!`,
      link: `/admin/articles`,
    });

    await sendTelegramTaskProgressNotification(
      authorId,
      article.title,
      'approved'
    );

    if (authorEmail) {
      await sendArticleReviewOutcomeEmail(
        authorEmail,
        article.title,
        'approved'
      );
    }

    // Write audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'article.approve',
      targetModel: 'Article',
      targetId: article._id,
      details: { title: article.title },
    });

    sendSuccess(res, article);
  }
);

// @desc    Publish approved article (SuperAdmin only)
// @route   PATCH /api/v1/articles/:id/publish
// @access  Private (SuperAdmin only)
export const publishArticle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const article = await ArticleModel.findById(id)
      .populate('topic', 'name slug')
      .populate('author', 'name email avatarUrl');

    if (!article) {
      return next(ApiError.notFound('Article not found', 'NOT_FOUND'));
    }

    if (article.status !== 'approved') {
      return next(
        ApiError.badRequest(
          'Article must be approved before it can be published.',
          'NOT_APPROVED'
        )
      );
    }

    article.status = 'published';
    article.publishedAt = new Date();
    await article.save();

    // Notify author
    const authorId = typeof article.author === 'object' ? (article.author as any)._id : article.author;
    const authorEmail = typeof article.author === 'object' ? (article.author as any).email : undefined;

    await createNotification({
      recipient: authorId,
      type: 'article_published',
      title: 'Article Published',
      body: `Your article "${article.title}" is now published and live on Qindil!`,
      link: `/articles/${article.slug}`,
    });

    await sendTelegramTaskProgressNotification(
      authorId,
      article.title,
      'published'
    );

    if (authorEmail) {
      await sendArticleReviewOutcomeEmail(
        authorEmail,
        article.title,
        'published'
      );
    }

    // Write audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'article.publish',
      targetModel: 'Article',
      targetId: article._id,
      details: { title: article.title, publishedAt: article.publishedAt },
    });

    sendSuccess(res, article);
  }
);

// @desc    Archive published article (SuperAdmin only)
// @route   PATCH /api/v1/articles/:id/archive
// @access  Private (SuperAdmin only)
export const archiveArticle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const article = await ArticleModel.findById(id)
      .populate('topic', 'name slug')
      .populate('author', 'name email avatarUrl');

    if (!article) {
      return next(ApiError.notFound('Article not found', 'NOT_FOUND'));
    }

    article.status = 'archived';
    await article.save();

    // Write audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'article.archive',
      targetModel: 'Article',
      targetId: article._id,
      details: { title: article.title },
    });

    sendSuccess(res, article);
  }
);

// @desc    Create new article draft
// @route   POST /api/v1/articles
// @access  Private (Admin & SuperAdmin)
export const createArticleDraft = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { title, topic, topicId, authorId } = req.body;
    const isSuperAdmin = req.user!.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    // Determine target author
    const targetAuthor = isSuperAdmin && authorId ? authorId : req.user!._id;

    let initialSlug = slugify(title);
    const slugExists = await ArticleModel.findOne({ slug: initialSlug });
    if (slugExists) {
      initialSlug = `${initialSlug}-${Date.now().toString().slice(-4)}`;
    }

    const article = await ArticleModel.create({
      title: title.trim(),
      slug: initialSlug,
      topic: topic || topicId || undefined,
      author: targetAuthor,
      status: 'draft',
      content: '',
      viewCount: 0,
    });

    const populatedArticle = await ArticleModel.findById(article._id)
      .populate('topic', 'name slug')
      .populate('author', 'name email avatarUrl');

    // Write audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'article.createDraft',
      targetModel: 'Article',
      targetId: article._id,
      details: { title: article.title, author: targetAuthor },
    });

    sendSuccess(res, populatedArticle || article, undefined, 201);
  }
);

// @desc    List articles management table (Role-aware)
// @route   GET /api/v1/articles
// @access  Private (Admin & SuperAdmin)
export const listArticlesAdmin = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const isSuperAdmin = req.user!.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    const { status, topic, author, search, page = 1, limit = 50 } = req.query;

    const queryFilter: any = {};

    if (!isSuperAdmin) {
      // Force filter regular admins to their own articles
      queryFilter.author = req.user!._id;
    } else {
      // SuperAdmin can filter by author
      if (author) {
        queryFilter.author = author;
      }
    }

    if (status) {
      queryFilter.status = status;
    }

    if (topic) {
      queryFilter.topic = topic;
    }

    if (search) {
      queryFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    const [articles, total] = await Promise.all([
      ArticleModel.find(queryFilter)
        .populate('topic', 'name slug')
        .populate('author', 'name email avatarUrl')
        .populate('lastEditedBy', 'name email avatarUrl')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ArticleModel.countDocuments(queryFilter),
    ]);

    sendSuccess(res, {
      items: articles,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  }
);

// @desc    Delete article draft (Draft status only)
// @route   DELETE /api/v1/articles/:id
// @access  Private (Admin & SuperAdmin)
export const deleteArticleDraft = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const callerId = req.user!._id.toString();
    const isSuperAdmin = req.user!.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    const article = await ArticleModel.findById(id);
    if (!article) {
      return next(ApiError.notFound('Article not found', 'NOT_FOUND'));
    }

    if (article.status !== 'draft') {
      return next(
        ApiError.badRequest(
          `Cannot delete article with status "${article.status}". Only draft articles can be deleted.`,
          'INVALID_STATUS'
        )
      );
    }

    const isAuthor = article.author.toString() === callerId;
    if (!isAuthor && !isSuperAdmin) {
      return next(
        ApiError.forbidden('You do not have permission to delete this draft.', 'FORBIDDEN')
      );
    }

    await ArticleModel.findByIdAndDelete(id);

    // Write audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'article.deleteDraft',
      targetModel: 'Article',
      targetId: article._id,
      details: { title: article.title },
    });

    sendSuccess(res, { message: 'Article draft deleted successfully' });
  }
);

export default {
  getMyArticles,
  getArticleForEdit,
  updateArticleDraft,
  submitForReview,
  listReviewQueue,
  reviewArticle,
  requestChanges,
  approveArticle,
  publishArticle,
  archiveArticle,
  createArticleDraft,
  listArticlesAdmin,
  deleteArticleDraft,
};


