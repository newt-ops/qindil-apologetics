import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import ArticleModel from '../models/Article.model.js';
import TaskModel from '../models/Task.model.js';
import VideoLogModel from '../models/VideoLog.model.js';
import { sendSuccess } from '../utils/apiResponse.js';

// @desc    Get aggregate analytics overview for SuperAdmin
// @route   GET /api/v1/analytics/overview
// @access  Private (SuperAdmin)
export const getOverview = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    // 1. Total Published Articles
    const totalPublishedArticles = await ArticleModel.countDocuments({ status: 'published' });

    // 2. Total Views across all articles
    const totalViewsAggregate = await ArticleModel.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } },
    ]);
    const totalViews = totalViewsAggregate[0]?.totalViews || 0;

    // 3. Articles by Status
    const rawArticleStats = await ArticleModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const articlesByStatus = {
      draft: 0,
      inReview: 0,
      changesRequested: 0,
      approved: 0,
      published: 0,
      archived: 0,
    };
    rawArticleStats.forEach((item) => {
      if (item._id && item._id in articlesByStatus) {
        articlesByStatus[item._id as keyof typeof articlesByStatus] = item.count;
      }
    });

    // 4. Videos by Stage
    const rawVideoStats = await VideoLogModel.aggregate([
      { $group: { _id: '$boardStage', count: { $sum: 1 } } },
    ]);

    const videosByStage = {
      idea: 0,
      scripting: 0,
      filming: 0,
      editing: 0,
      review: 0,
      published: 0,
    };
    rawVideoStats.forEach((item) => {
      if (item._id && item._id in videosByStage) {
        videosByStage[item._id as keyof typeof videosByStage] = item.count;
      }
    });

    // 5. Tasks by Status
    const rawTaskStats = await TaskModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const tasksByStatus = {
      pending: 0,
      inProgress: 0,
      inReview: 0,
      done: 0,
      overdue: 0,
    };
    rawTaskStats.forEach((item) => {
      if (item._id && item._id in tasksByStatus) {
        tasksByStatus[item._id as keyof typeof tasksByStatus] = item.count;
      }
    });

    const activeTasksCount =
      tasksByStatus.pending + tasksByStatus.inProgress + tasksByStatus.inReview;

    // 6. Top 5 Articles by View Count
    const topArticles = await ArticleModel.find({ status: 'published' })
      .select('title slug viewCount publishedAt topic')
      .populate('topic', 'name slug')
      .sort({ viewCount: -1 })
      .limit(5)
      .lean();

    sendSuccess(res, {
      totalPublishedArticles,
      totalViews,
      activeTasksCount,
      articlesByStatus,
      videosByStage,
      tasksByStatus,
      topArticles,
    });
  }
);

// @desc    Get published articles count grouped over time range (30d, 90d, 1y)
// @route   GET /api/v1/analytics/articles-over-time
// @access  Private (SuperAdmin)
export const getArticlesOverTime = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const range = (req.query.range as string) || '30d';

    const now = new Date();
    const startDate = new Date();

    if (range === '90d') {
      startDate.setDate(now.getDate() - 90);
    } else if (range === '1y') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // Default: 30d
      startDate.setDate(now.getDate() - 30);
    }

    const format = range === '1y' ? '%Y-%m' : '%Y-%m-%d';

    const stats = await ArticleModel.aggregate([
      {
        $match: {
          status: 'published',
          $or: [
            { publishedAt: { $gte: startDate } },
            { createdAt: { $gte: startDate } },
          ],
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format,
              date: { $ifNull: ['$publishedAt', '$createdAt'] },
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = stats.map((item) => ({
      date: item._id,
      count: item.count,
    }));

    sendSuccess(res, { range, data: result });
  }
);

// @desc    Get completed tasks count per team member over time range (30d, 90d, 1y)
// @route   GET /api/v1/analytics/team-activity
// @access  Private (SuperAdmin)
export const getTeamActivity = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const range = (req.query.range as string) || '30d';

    const now = new Date();
    const startDate = new Date();

    if (range === '90d') {
      startDate.setDate(now.getDate() - 90);
    } else if (range === '1y') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // Default: 30d
      startDate.setDate(now.getDate() - 30);
    }

    const activity = await TaskModel.aggregate([
      {
        $match: {
          status: 'done',
          updatedAt: { $gte: startDate },
        },
      },
      { $unwind: '$assignedTo' },
      {
        $group: {
          _id: '$assignedTo',
          completedTasksCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          user: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email',
            avatarUrl: '$user.avatarUrl',
          },
          completedTasksCount: 1,
        },
      },
      { $sort: { completedTasksCount: -1 } },
    ]);

    sendSuccess(res, { range, data: activity });
  }
);

export default {
  getOverview,
  getArticlesOverTime,
  getTeamActivity,
};
