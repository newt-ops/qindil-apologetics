import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import TopicModel from '../models/Topic.model.js';
import ArticleModel from '../models/Article.model.js';
import AuditLogModel from '../models/AuditLog.model.js';
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

// @desc    List all topics for Admin/SuperAdmin (including inactive & article counts)
// @route   GET /api/v1/topics
// @access  Private (SuperAdmin)
export const listTopicsAdmin = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const topics = await TopicModel.find().sort({ order: 1, createdAt: -1 });

    // Aggregate article counts per topic
    const counts = await ArticleModel.aggregate([
      { $group: { _id: '$topic', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((c) => {
      if (c._id) {
        countMap.set(c._id.toString(), c.count);
      }
    });

    const result = topics.map((t) => ({
      ...t.toObject(),
      articleCount: countMap.get(t._id.toString()) || 0,
    }));

    sendSuccess(res, result);
  }
);

// @desc    Create a new topic
// @route   POST /api/v1/topics
// @access  Private (SuperAdmin)
export const createTopic = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, slug: inputSlug, description, coverImageUrl, order } = req.body;

    let finalSlug = inputSlug ? slugify(inputSlug) : slugify(name);

    // Ensure slug uniqueness
    const existingTopic = await TopicModel.findOne({ slug: finalSlug });
    if (existingTopic) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Determine default order if not supplied
    let topicOrder = order;
    if (topicOrder === undefined || topicOrder === null) {
      const highestOrderTopic = await TopicModel.findOne().sort({ order: -1 });
      topicOrder = highestOrderTopic ? highestOrderTopic.order + 1 : 1;
    }

    const topic = await TopicModel.create({
      name,
      slug: finalSlug,
      description,
      coverImageUrl,
      order: topicOrder,
      isActive: true,
    });

    // Write audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'topic.create',
      targetModel: 'Topic',
      targetId: topic._id,
      details: { name: topic.name, slug: topic.slug },
    });

    sendSuccess(res, topic, undefined, 201);
  }
);

// @desc    Update an existing topic
// @route   PATCH /api/v1/topics/:id
// @access  Private (SuperAdmin)
export const updateTopic = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { name, slug: inputSlug, description, coverImageUrl, order, isActive } = req.body;

    const topic = await TopicModel.findById(id);
    if (!topic) {
      return next(ApiError.notFound('Topic not found', 'NOT_FOUND'));
    }

    if (name !== undefined) topic.name = name;
    if (description !== undefined) topic.description = description;
    if (coverImageUrl !== undefined) topic.coverImageUrl = coverImageUrl;
    if (order !== undefined) topic.order = order;
    if (isActive !== undefined) topic.isActive = isActive;

    if (inputSlug) {
      const newSlug = slugify(inputSlug);
      if (newSlug !== topic.slug) {
        const slugExists = await TopicModel.findOne({ slug: newSlug, _id: { $ne: id } });
        if (slugExists) {
          return next(ApiError.badRequest('A topic with this slug already exists.', 'SLUG_EXISTS'));
        }
        topic.slug = newSlug;
      }
    } else if (name && !inputSlug) {
      const newSlug = slugify(name);
      if (newSlug !== topic.slug) {
        const slugExists = await TopicModel.findOne({ slug: newSlug, _id: { $ne: id } });
        if (!slugExists) {
          topic.slug = newSlug;
        }
      }
    }

    await topic.save();

    // Write audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'topic.update',
      targetModel: 'Topic',
      targetId: topic._id,
      details: { name: topic.name, isActive: topic.isActive },
    });

    sendSuccess(res, topic);
  }
);

// @desc    Soft-delete / Deactivate a topic (blocks hard delete)
// @route   DELETE /api/v1/topics/:id
// @access  Private (SuperAdmin)
export const deleteTopic = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const topic = await TopicModel.findById(id);
    if (!topic) {
      return next(ApiError.notFound('Topic not found', 'NOT_FOUND'));
    }

    // Soft delete: set isActive to false
    topic.isActive = false;
    await topic.save();

    // Write audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'topic.deactivate',
      targetModel: 'Topic',
      targetId: topic._id,
      details: { name: topic.name },
    });

    sendSuccess(res, { message: 'Topic deactivated successfully.', topic });
  }
);

// @desc    Bulk reorder topics
// @route   PATCH /api/v1/topics/reorder
// @access  Private (SuperAdmin)
export const reorderTopics = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { orderedIds } = req.body as { orderedIds: string[] };

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index + 1 } },
      },
    }));

    if (bulkOps.length > 0) {
      await TopicModel.bulkWrite(bulkOps);
    }

    // Write audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'topic.reorder',
      targetModel: 'Topic',
      details: { count: orderedIds.length },
    });

    const updatedTopics = await TopicModel.find().sort({ order: 1 });
    sendSuccess(res, updatedTopics);
  }
);

export default {
  listTopicsAdmin,
  createTopic,
  updateTopic,
  deleteTopic,
  reorderTopics,
};
