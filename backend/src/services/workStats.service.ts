import { Types } from 'mongoose';
import ArticleModel from '../models/Article.model.js';
import VideoLogModel from '../models/VideoLog.model.js';
import { TaskModel } from '../models/Task.model.js';
import { ArticleProposalModel } from '../models/ArticleProposal.model.js';

export interface MemberWorkStats {
  articles: {
    published: number;
    approved: number;
    inReview: number;
    drafts: number;
    total: number;
    totalViews: number;
  };
  videos: {
    completed: number;
    inProgress: number;
    total: number;
  };
  tasks: {
    completed: number;
    inProgress: number;
    inReview: number;
    pending: number;
    overdue: number;
    total: number;
    completionRate: number;
  };
  proposals: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
}

/**
 * Aggregates all work products and performance stats for a single scholar/team member
 */
export const calculateMemberWorkStats = async (
  userIdInput: string | Types.ObjectId
): Promise<MemberWorkStats> => {
  const userId = typeof userIdInput === 'string' ? new Types.ObjectId(userIdInput) : userIdInput;
  const now = new Date();

  // 1. Articles Aggregations
  const [
    publishedArticles,
    approvedArticles,
    inReviewArticles,
    draftArticles,
    totalArticles,
    viewsAggregation,
  ] = await Promise.all([
    ArticleModel.countDocuments({ author: userId, status: 'published' }),
    ArticleModel.countDocuments({ author: userId, status: 'approved' }),
    ArticleModel.countDocuments({ author: userId, status: 'inReview' }),
    ArticleModel.countDocuments({ author: userId, status: { $in: ['draft', 'changesRequested'] } }),
    ArticleModel.countDocuments({ author: userId }),
    ArticleModel.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } },
    ]),
  ]);

  const totalViews = viewsAggregation[0]?.totalViews || 0;

  // 2. Videos Aggregations
  const [completedVideos, inProgressVideos, totalVideos] = await Promise.all([
    VideoLogModel.countDocuments({ creator: userId, status: 'published' }),
    VideoLogModel.countDocuments({ creator: userId, status: { $ne: 'published' } }),
    VideoLogModel.countDocuments({ creator: userId }),
  ]);

  // 3. Operational Tasks Aggregations
  const [
    completedTasks,
    inProgressTasks,
    inReviewTasks,
    pendingTasks,
    overdueTasks,
    totalTasks,
  ] = await Promise.all([
    TaskModel.countDocuments({ assignedTo: userId, status: 'done' }),
    TaskModel.countDocuments({ assignedTo: userId, status: 'inProgress' }),
    TaskModel.countDocuments({ assignedTo: userId, status: 'inReview' }),
    TaskModel.countDocuments({ assignedTo: userId, status: 'pending' }),
    TaskModel.countDocuments({
      assignedTo: userId,
      dueDate: { $lt: now },
      status: { $ne: 'done' },
    }),
    TaskModel.countDocuments({ assignedTo: userId }),
  ]);

  const activeDenominator = completedTasks + overdueTasks + inProgressTasks + inReviewTasks;
  const completionRate =
    activeDenominator > 0 ? Math.round((completedTasks / activeDenominator) * 100) : 100;

  // 4. Proposals Aggregations
  const [pendingProposals, approvedProposals, rejectedProposals, totalProposals] =
    await Promise.all([
      ArticleProposalModel.countDocuments({ author: userId, status: 'pending' }),
      ArticleProposalModel.countDocuments({ author: userId, status: 'approved' }),
      ArticleProposalModel.countDocuments({ author: userId, status: 'rejected' }),
      ArticleProposalModel.countDocuments({ author: userId }),
    ]);

  return {
    articles: {
      published: publishedArticles,
      approved: approvedArticles,
      inReview: inReviewArticles,
      drafts: draftArticles,
      total: totalArticles,
      totalViews,
    },
    videos: {
      completed: completedVideos,
      inProgress: inProgressVideos,
      total: totalVideos,
    },
    tasks: {
      completed: completedTasks,
      inProgress: inProgressTasks,
      inReview: inReviewTasks,
      pending: pendingTasks,
      overdue: overdueTasks,
      total: totalTasks,
      completionRate,
    },
    proposals: {
      pending: pendingProposals,
      approved: approvedProposals,
      rejected: rejectedProposals,
      total: totalProposals,
    },
  };
};

export default calculateMemberWorkStats;
