import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import VideoLogModel from '../models/VideoLog.model.js';
import TaskModel from '../models/Task.model.js';
import UserModel from '../models/User.model.js';
import AuditLogModel from '../models/AuditLog.model.js';
import { createNotification } from '../services/notify.js';
import { sendTelegramTaskProgressNotification } from '../telegram/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

// @desc    Get video detail by ID
// @route   GET /api/v1/videos/:id
// @access  Private (Creator or SuperAdmin)
export const getVideoById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const callerId = req.user!._id.toString();
    const isSuperAdmin = req.user!.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    const video = await VideoLogModel.findById(id)
      .populate('creator', 'name email avatarUrl')
      .populate({
        path: 'linkedTaskId',
        select: 'title description dueDate status assignedTo createdBy videoType destination targetVideoUrl',
        populate: { path: 'assignedTo createdBy', select: 'name email avatarUrl' },
      });

    if (!video) {
      return next(ApiError.notFound('Video log not found', 'NOT_FOUND'));
    }

    const creatorId =
      typeof video.creator === 'object' && video.creator
        ? (video.creator as any)._id?.toString()
        : (video.creator as any)?.toString();

    const isCreator = creatorId === callerId;

    if (!isCreator && !isSuperAdmin) {
      return next(
        ApiError.forbidden(
          'You do not have permission to view details for this video log.',
          'FORBIDDEN'
        )
      );
    }

    sendSuccess(res, video);
  }
);

// @desc    Accept video task and create VideoLog workspace
// @route   PATCH /api/v1/videos/:id/accept
// @access  Private (Assignee / Creator only)
export const acceptVideoTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const callerId = req.user!._id.toString();

    let task = await TaskModel.findById(id);
    let videoLog = await VideoLogModel.findById(id);

    if (!task && videoLog && videoLog.linkedTaskId) {
      task = await TaskModel.findById(videoLog.linkedTaskId);
    }

    if (!task) {
      return next(ApiError.notFound('Task not found', 'NOT_FOUND'));
    }

    const isAssignee = task.assignedTo.some((uid) => uid.toString() === callerId);
    if (!isAssignee) {
      return next(
        ApiError.forbidden('Only an assigned team member can accept this video task.', 'FORBIDDEN')
      );
    }

    if (task.status !== 'pending') {
      return next(
        ApiError.conflict(
          `Task cannot be accepted because its status is "${task.status}".`,
          'TASK_NOT_PENDING'
        )
      );
    }

    task.status = 'inProgress';

    if (!videoLog) {
      videoLog = await VideoLogModel.create({
        title: task.title,
        creator: req.user!._id,
        videoType: task.videoType || 'normal',
        destination: task.destination || 'official',
        targetVideoUrl: task.targetVideoUrl || undefined,
        status: 'inProgress',
        linkedTaskId: task._id,
      });

      task.linkedVideo = videoLog._id as any;
    } else {
      videoLog.status = 'inProgress';
      await videoLog.save();
    }

    await task.save();

    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'video.acceptTask',
      targetModel: 'VideoLog',
      targetId: videoLog._id,
      details: { title: videoLog.title, linkedTaskId: task._id },
    });

    const populatedVideo = await VideoLogModel.findById(videoLog._id)
      .populate('creator', 'name email avatarUrl')
      .populate('linkedTaskId', 'title description dueDate status assignedTo');

    sendSuccess(res, populatedVideo || videoLog);
  }
);

// @desc    Update video log details (posterUrl, notes, etc.)
// @route   PATCH /api/v1/videos/:id
// @access  Private (Creator or SuperAdmin)
export const updateVideoDetails = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { posterUrl, notes, submittedUrl, targetVideoUrl, destination, videoType } = req.body;
    const callerId = req.user!._id.toString();
    const isSuperAdmin = req.user!.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    const video = await VideoLogModel.findById(id);
    if (!video) {
      return next(ApiError.notFound('Video log not found', 'NOT_FOUND'));
    }

    const isCreator = video.creator.toString() === callerId;
    if (!isCreator && !isSuperAdmin) {
      return next(
        ApiError.forbidden(
          'You do not have permission to update details for this video.',
          'FORBIDDEN'
        )
      );
    }

    if (posterUrl !== undefined) video.posterUrl = posterUrl;
    if (notes !== undefined) video.notes = notes;
    if (submittedUrl !== undefined) video.submittedUrl = submittedUrl;
    if (targetVideoUrl !== undefined) video.targetVideoUrl = targetVideoUrl;
    if (destination !== undefined) video.destination = destination;
    if (videoType !== undefined) video.videoType = videoType;

    await video.save();

    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'video.updateDetails',
      targetModel: 'VideoLog',
      targetId: video._id,
      details: { title: video.title, posterUrl, notes, submittedUrl },
    });

    const updatedVideo = await VideoLogModel.findById(video._id)
      .populate('creator', 'name email avatarUrl')
      .populate('linkedTaskId', 'title description dueDate status assignedTo');

    sendSuccess(res, updatedVideo || video);
  }
);

// @desc    Submit video task for SuperAdmin review or posting
// @route   PATCH /api/v1/videos/:id/submit
// @access  Private (Creator only)
export const submitVideoTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { submittedUrl } = req.body || {};
    const callerId = req.user!._id.toString();

    const video = await VideoLogModel.findById(id);
    if (!video) {
      return next(ApiError.notFound('Video log not found', 'NOT_FOUND'));
    }

    const isCreator = video.creator.toString() === callerId;
    if (!isCreator) {
      return next(
        ApiError.forbidden('Only the assigned video creator can submit this task.', 'FORBIDDEN')
      );
    }

    const isPersonal = video.destination === 'personal';

    if (isPersonal && (!submittedUrl || !submittedUrl.trim())) {
      return next(
        ApiError.badRequest(
          'Submitted Video URL is required when destination is personal account.',
          'MISSING_SUBMITTED_URL'
        )
      );
    }

    if (submittedUrl) {
      video.submittedUrl = submittedUrl.trim();
    }

    video.status = 'submitted';
    await video.save();

    if (video.linkedTaskId) {
      await TaskModel.findByIdAndUpdate(video.linkedTaskId, { $set: { status: 'inReview' } });
    }

    // Notify all SuperAdmins
    const superAdmins = await UserModel.find({ isActive: true }).populate('roles');
    const superAdminUsers = superAdmins.filter((u) =>
      u.roles.some((r: any) => (typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'))
    );

    for (const sa of superAdminUsers) {
      await createNotification({
        recipient: sa._id as any,
        type: 'video_submitted',
        title: 'Video Task Submitted',
        body: `"${video.title}" by ${req.user!.name} is ready for ${
          isPersonal ? 'SuperAdmin review' : 'posting to official channel'
        }.`,
        link: `/admin/videos/${video._id}`,
      });
    }

    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'video.submitTask',
      targetModel: 'VideoLog',
      targetId: video._id,
      details: { title: video.title, destination: video.destination, submittedUrl: video.submittedUrl },
    });

    const updatedVideo = await VideoLogModel.findById(video._id)
      .populate('creator', 'name email avatarUrl')
      .populate('linkedTaskId', 'title description dueDate status assignedTo');

    sendSuccess(res, updatedVideo || video);
  }
);

// @desc    Review video task (SuperAdmin decision for personal account submissions)
// @route   PATCH /api/v1/videos/:id/review
// @access  Private (SuperAdmin only)
export const reviewVideoTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { decision, reviewNotes } = req.body;

    if (!['approve', 'requestChanges'].includes(decision)) {
      return next(
        ApiError.badRequest(
          'Invalid review decision. Must be "approve" or "requestChanges".',
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

    const video = await VideoLogModel.findById(id).populate('creator', 'name email avatarUrl');
    if (!video) {
      return next(ApiError.notFound('Video log not found', 'NOT_FOUND'));
    }

    const creatorId = typeof video.creator === 'object' ? (video.creator as any)._id : video.creator;

    if (decision === 'requestChanges') {
      video.status = 'changesRequested';
      video.reviewNotes = reviewNotes.trim();
      await video.save();

      if (video.linkedTaskId) {
        await TaskModel.findByIdAndUpdate(video.linkedTaskId, { $set: { status: 'inProgress' } });
      }

      await createNotification({
        recipient: creatorId,
        type: 'changes_requested',
        title: 'Changes Requested on Video Task',
        body: `Reviewer notes for "${video.title}": ${reviewNotes.trim()}`,
        link: `/admin/videos/${video._id}`,
      });

      await sendTelegramTaskProgressNotification(
        creatorId,
        video.title,
        'changes_requested',
        reviewNotes.trim()
      );
    } else if (decision === 'approve') {
      video.status = 'approved';
      if (reviewNotes) video.reviewNotes = reviewNotes.trim();
      await video.save();

      await createNotification({
        recipient: creatorId,
        type: 'video_approved',
        title: 'Video Approved',
        body: `Your video "${video.title}" has been approved for publishing on your personal account!`,
        link: `/admin/videos/${video._id}`,
      });

      await sendTelegramTaskProgressNotification(creatorId, video.title, 'approved');
    }

    await AuditLogModel.create({
      actor: req.user!._id,
      action: `video.review.${decision}`,
      targetModel: 'VideoLog',
      targetId: video._id,
      details: { title: video.title, decision, reviewNotes: reviewNotes || '' },
    });

    const updatedVideo = await VideoLogModel.findById(video._id)
      .populate('creator', 'name email avatarUrl')
      .populate('linkedTaskId', 'title description dueDate status assignedTo');

    sendSuccess(res, updatedVideo || video);
  }
);

// @desc    Post published video task (SuperAdmin publishes official or approved personal video)
// @route   PATCH /api/v1/videos/:id/post
// @access  Private (SuperAdmin only)
export const postVideoTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { publishedUrl } = req.body || {};

    if (!publishedUrl || !publishedUrl.trim()) {
      return next(
        ApiError.badRequest(
          'Published video URL is required to finalize posting.',
          'MISSING_PUBLISHED_URL'
        )
      );
    }

    const video = await VideoLogModel.findById(id).populate('creator', 'name email avatarUrl');
    if (!video) {
      return next(ApiError.notFound('Video log not found', 'NOT_FOUND'));
    }

    video.publishedUrl = publishedUrl.trim();
    video.status = 'posted';
    video.publishedAt = new Date();
    await video.save();

    if (video.linkedTaskId) {
      await TaskModel.findByIdAndUpdate(video.linkedTaskId, { $set: { status: 'done' } });
    }

    const creatorId = typeof video.creator === 'object' ? (video.creator as any)._id : video.creator;

    await createNotification({
      recipient: creatorId,
      type: 'video_posted',
      title: 'Video Published Live',
      body: `Your video "${video.title}" is now published live!`,
      link: publishedUrl.trim(),
    });

    await sendTelegramTaskProgressNotification(creatorId, video.title, 'published');

    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'video.postTask',
      targetModel: 'VideoLog',
      targetId: video._id,
      details: { title: video.title, publishedUrl: publishedUrl.trim() },
    });

    const updatedVideo = await VideoLogModel.findById(video._id)
      .populate('creator', 'name email avatarUrl')
      .populate('linkedTaskId', 'title description dueDate status assignedTo');

    sendSuccess(res, updatedVideo || video);
  }
);

export default {
  getVideoById,
  acceptVideoTask,
  updateVideoDetails,
  submitVideoTask,
  reviewVideoTask,
  postVideoTask,
};
