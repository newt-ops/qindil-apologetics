import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { ArticleProposalModel } from '../models/ArticleProposal.model.js';
import { UserModel } from '../models/User.model.js';
import { TopicModel } from '../models/Topic.model.js';
import { AuditLogModel } from '../models/AuditLog.model.js';
import { createNotification } from '../services/notify.js';
import {
  sendTelegramArticleProposalNotification,
  sendTelegramProposalDecisionNotification,
} from '../telegram/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

// @desc    Submit a new Article Proposal (by team member or admin)
// @route   POST /api/v1/article-proposals
// @access  Private (Admin & SuperAdmin)
export const createArticleProposal = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { title, topic, summary, proposedDueDate } = req.body;
    const authorId = req.user!._id;

    let dueDateObj: Date | undefined;
    if (proposedDueDate) {
      const parsed = new Date(proposedDueDate);
      if (!isNaN(parsed.getTime())) {
        dueDateObj = parsed;
      }
    }

    const proposal = await ArticleProposalModel.create({
      author: authorId,
      title: title.trim(),
      topic: topic || undefined,
      summary: summary.trim(),
      proposedDueDate: dueDateObj,
      status: 'pending',
    });

    const populatedProposal = await ArticleProposalModel.findById(proposal._id)
      .populate('topic', 'name slug')
      .populate('author', 'name email avatarUrl');

    const authorName = req.user!.name || 'Team Scholar';
    const topicDoc = topic ? await TopicModel.findById(topic) : null;
    const topicName = topicDoc?.name;

    // 1. Send in-app notifications to all SuperAdmins
    const superAdmins = await UserModel.find({ isActive: true }).populate('roles');
    const targetSuperAdmins = superAdmins.filter((u) =>
      u.roles.some((r: any) => (typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'))
    );

    for (const sa of targetSuperAdmins) {
      await createNotification({
        recipient: sa._id as any,
        type: 'article_proposal',
        title: 'New Article Proposal Submitted',
        body: `"${proposal.title}" submitted by ${authorName}.`,
        link: '/admin/articles?tab=proposals',
      });
    }

    // 2. Trigger Telegram bot notification for SuperAdmins
    await sendTelegramArticleProposalNotification(
      {
        _id: proposal._id,
        title: proposal.title,
        summary: proposal.summary,
        topicName,
      },
      authorName
    );

    // 3. Write Audit Log
    await AuditLogModel.create({
      actor: authorId,
      action: 'articleProposal.create',
      targetType: 'ArticleProposal',
      targetId: proposal._id,
      metadata: {
        title: proposal.title,
        topicName,
        summary: proposal.summary,
      },
    });

    sendSuccess(res, populatedProposal || proposal, undefined, 201);
  }
);

// @desc    Get author's own Article Proposals
// @route   GET /api/v1/article-proposals/mine
// @access  Private (Admin & SuperAdmin)
export const getMyProposals = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authorId = req.user!._id;

    const proposals = await ArticleProposalModel.find({ author: authorId })
      .populate('topic', 'name slug')
      .populate('assignedTaskId', 'title status dueDate')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    sendSuccess(res, proposals);
  }
);

// @desc    List all Article Proposals (with search & status filtering)
// @route   GET /api/v1/article-proposals
// @access  Private (SuperAdmin only)
export const listAllProposals = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { status, search, page = 1, limit = 20 } = req.query;

    const filter: Record<string, any> = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && typeof search === 'string' && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { summary: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [total, items] = await Promise.all([
      ArticleProposalModel.countDocuments(filter),
      ArticleProposalModel.find(filter)
        .populate('author', 'name email avatarUrl roles')
        .populate('topic', 'name slug')
        .populate('assignedTaskId', 'title status dueDate')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    sendSuccess(res, items, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    });
  }
);

// @desc    Reject / Decline an Article Proposal
// @route   PATCH /api/v1/article-proposals/:id/reject
// @access  Private (SuperAdmin only)
export const rejectProposal = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { adminFeedback } = req.body;

    const proposal = await ArticleProposalModel.findById(id).populate('author', 'name email');

    if (!proposal) {
      return next(ApiError.notFound('Article proposal not found', 'NOT_FOUND'));
    }

    if (proposal.status !== 'pending') {
      return next(
        ApiError.badRequest(
          `Proposal cannot be rejected because it is already marked "${proposal.status}".`,
          'INVALID_STATUS'
        )
      );
    }

    proposal.status = 'rejected';
    proposal.adminFeedback = adminFeedback.trim();
    proposal.reviewedBy = req.user!._id;
    proposal.reviewedAt = new Date();
    await proposal.save();

    const authorId = typeof proposal.author === 'object' ? (proposal.author as any)._id : proposal.author;

    // 1. In-app web notification to author
    await createNotification({
      recipient: authorId,
      type: 'proposal_rejected',
      title: 'Article Proposal Decision',
      body: `Feedback on "${proposal.title}": ${adminFeedback.trim()}`,
      link: '/admin/articles/mine',
    });

    // 2. Telegram bot notification to author
    await sendTelegramProposalDecisionNotification(
      authorId,
      proposal.title,
      'rejected',
      adminFeedback.trim()
    );

    // 3. Audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'articleProposal.reject',
      targetType: 'ArticleProposal',
      targetId: proposal._id,
      metadata: {
        title: proposal.title,
        author: authorId,
        adminFeedback: adminFeedback.trim(),
      },
    });

    sendSuccess(res, proposal);
  }
);

export default {
  createArticleProposal,
  getMyProposals,
  listAllProposals,
  rejectProposal,
};
