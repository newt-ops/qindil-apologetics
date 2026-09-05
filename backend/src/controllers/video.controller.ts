import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import VideoLogModel, { VideoBoardStage } from '../models/VideoLog.model.js';
import TaskModel from '../models/Task.model.js';
import AuditLogModel from '../models/AuditLog.model.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

const STAGES: VideoBoardStage[] = [
  'idea',
  'scripting',
  'filming',
  'editing',
  'review',
  'published',
];

// @desc    List video logs on production board (Role-scoped)
// @route   GET /api/v1/videos/board
// @access  Private (Admin & SuperAdmin)
export const listBoard = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const callerId = req.user!._id.toString();
    const isSuperAdmin = req.user!.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    const filter: any = {};
    if (!isSuperAdmin) {
      // Regular admin sees only videos where they are contentCreator or editor
      filter.$or = [{ contentCreator: callerId }, { editor: callerId }];
    }

    const videos = await VideoLogModel.find(filter)
      .populate('task', 'title description dueDate status assignedTo createdBy')
      .populate('contentCreator', 'name email avatarUrl')
      .populate('editor', 'name email avatarUrl')
      .populate('category', 'name slug')
      .sort({ updatedAt: -1 });

    sendSuccess(res, videos);
  }
);

// @desc    Move video stage on production board (Adjacent stage only)
// @route   PATCH /api/v1/videos/:id/stage
// @access  Private (Admin & SuperAdmin)
export const moveStage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { stage: targetStage } = req.body as { stage: VideoBoardStage };
    const callerId = req.user!._id.toString();
    const isSuperAdmin = req.user!.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    const video = await VideoLogModel.findById(id);
    if (!video) {
      return next(ApiError.notFound('Video log not found', 'NOT_FOUND'));
    }

    // Ownership check: must be contentCreator, editor, or superAdmin
    const isCreator = video.contentCreator.toString() === callerId;
    const isEditor = video.editor.toString() === callerId;
    if (!isCreator && !isEditor && !isSuperAdmin) {
      return next(
        ApiError.forbidden(
          'You do not have permission to move the stage for this video.',
          'FORBIDDEN'
        )
      );
    }

    const currentIdx = STAGES.indexOf(video.boardStage);
    const targetIdx = STAGES.indexOf(targetStage);

    if (targetIdx === -1) {
      return next(ApiError.badRequest('Invalid target board stage.', 'INVALID_STAGE'));
    }

    // Validate single-adjacent move (forward or backward by exactly 1 stage)
    if (Math.abs(targetIdx - currentIdx) !== 1) {
      return next(
        ApiError.badRequest(
          `Cannot move from "${video.boardStage}" to "${targetStage}". Stage movement must be strictly adjacent (1 step forward or backward).`,
          'INVALID_STAGE_TRANSITION'
        )
      );
    }

    const previousStage = video.boardStage;
    video.boardStage = targetStage;
    video.stageHistory.push({
      stage: targetStage,
      movedBy: req.user!._id as any,
      movedAt: new Date(),
    });

    if (targetStage === 'published') {
      video.publishedAt = new Date();

      // If linked task exists, set Task.status -> 'done'
      if (video.task) {
        await TaskModel.findByIdAndUpdate(video.task, { status: 'done' });
      }
    }

    await video.save();

    // Audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'video.moveStage',
      targetModel: 'VideoLog',
      targetId: video._id,
      details: { title: video.title, previousStage, newStage: targetStage },
    });

    const updatedVideo = await VideoLogModel.findById(video._id)
      .populate('task', 'title description dueDate status assignedTo')
      .populate('contentCreator', 'name email avatarUrl')
      .populate('editor', 'name email avatarUrl')
      .populate('category', 'name slug');

    sendSuccess(res, updatedVideo || video);
  }
);

// @desc    Update video log details (posterUrl, publishedUrl, notes)
// @route   PATCH /api/v1/videos/:id
// @access  Private (Admin & SuperAdmin)
export const updateVideoDetails = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { posterUrl, publishedUrl, notes } = req.body;
    const callerId = req.user!._id.toString();
    const isSuperAdmin = req.user!.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    const video = await VideoLogModel.findById(id);
    if (!video) {
      return next(ApiError.notFound('Video log not found', 'NOT_FOUND'));
    }

    // Ownership check
    const isCreator = video.contentCreator.toString() === callerId;
    const isEditor = video.editor.toString() === callerId;
    if (!isCreator && !isEditor && !isSuperAdmin) {
      return next(
        ApiError.forbidden(
          'You do not have permission to update details for this video.',
          'FORBIDDEN'
        )
      );
    }

    if (posterUrl !== undefined) video.posterUrl = posterUrl;
    if (publishedUrl !== undefined) video.publishedUrl = publishedUrl;
    if (notes !== undefined) video.notes = notes;

    // If publishedUrl is supplied and stage is published, set task status to 'done'
    if (publishedUrl && video.boardStage === 'published' && video.task) {
      await TaskModel.findByIdAndUpdate(video.task, { status: 'done' });
    }

    await video.save();

    // Audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'video.updateDetails',
      targetModel: 'VideoLog',
      targetId: video._id,
      details: { title: video.title, posterUrl, publishedUrl, notes },
    });

    const updatedVideo = await VideoLogModel.findById(video._id)
      .populate('task', 'title description dueDate status assignedTo')
      .populate('contentCreator', 'name email avatarUrl')
      .populate('editor', 'name email avatarUrl')
      .populate('category', 'name slug');

    sendSuccess(res, updatedVideo || video);
  }
);

// @desc    Get single video log detail by ID with full stage history
// @route   GET /api/v1/videos/:id
// @access  Private (ContentCreator, Editor, or SuperAdmin)
export const getVideoById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const callerId = req.user!._id.toString();
    const isSuperAdmin = req.user!.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    const video = await VideoLogModel.findById(id)
      .populate('task', 'title description dueDate status assignedTo createdBy')
      .populate('contentCreator', 'name email avatarUrl')
      .populate('editor', 'name email avatarUrl')
      .populate('category', 'name slug')
      .populate('stageHistory.movedBy', 'name email avatarUrl');

    if (!video) {
      return next(ApiError.notFound('Video log not found', 'NOT_FOUND'));
    }

    const isCreator = video.contentCreator._id.toString() === callerId;
    const isEditor = video.editor._id.toString() === callerId;

    if (!isCreator && !isEditor && !isSuperAdmin) {
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

export default {
  listBoard,
  getVideoById,
  moveStage,
  updateVideoDetails,
};

