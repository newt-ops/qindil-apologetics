import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { CommentModel } from '../models/Comment.model.js';
import { TaskModel } from '../models/Task.model.js';
import { createNotification } from '../services/notify.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

// Helper to verify task visibility for caller
function checkTaskVisibility(task: any, user: any): boolean {
  const callerId = user._id.toString();
  const isAssignee = task.assignedTo.some((uid: any) => uid.toString() === callerId);
  const isCreator = task.createdBy.toString() === callerId;
  const isSuperAdmin = user.roles.some((r: any) =>
    typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
  );

  return isAssignee || isCreator || isSuperAdmin;
}

// @desc    List comments for a specific task
// @route   GET /api/v1/tasks/:taskId/comments
// @access  Private (Task Assignees, Creator, or SuperAdmin)
export const listComments = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { taskId } = req.params;

    const task = await TaskModel.findById(taskId);
    if (!task) {
      return next(ApiError.notFound('Task not found', 'NOT_FOUND'));
    }

    if (!checkTaskVisibility(task, req.user!)) {
      return next(
        ApiError.forbidden('You do not have permission to view comments for this task.', 'FORBIDDEN')
      );
    }

    const comments = await CommentModel.find({ task: taskId })
      .populate('author', 'name email avatarUrl')
      .sort({ createdAt: 1 })
      .lean();

    sendSuccess(res, comments);
  }
);

// @desc    Add a comment to a task thread
// @route   POST /api/v1/tasks/:taskId/comments
// @access  Private (Task Assignees, Creator, or SuperAdmin)
export const addComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { taskId } = req.params;
    const { body } = req.body;

    const task = await TaskModel.findById(taskId);
    if (!task) {
      return next(ApiError.notFound('Task not found', 'NOT_FOUND'));
    }

    if (!checkTaskVisibility(task, req.user!)) {
      return next(
        ApiError.forbidden('You do not have permission to comment on this task.', 'FORBIDDEN')
      );
    }

    const comment = await CommentModel.create({
      task: taskId,
      author: req.user!._id,
      body,
    });

    await comment.populate('author', 'name email avatarUrl');

    // Notify all participants (assignees + creator), excluding comment author
    const authorIdStr = req.user!._id.toString();
    const participantIds = new Set<string>();

    task.assignedTo.forEach((id) => participantIds.add(id.toString()));
    if (task.createdBy) {
      participantIds.add(task.createdBy.toString());
    }
    participantIds.delete(authorIdStr);

    for (const recipientId of Array.from(participantIds)) {
      await createNotification({
        recipient: recipientId as any,
        type: 'comment',
        title: `New Comment on: "${task.title}"`,
        body: `${req.user!.name}: ${body.length > 90 ? body.substring(0, 90) + '...' : body}`,
        link: `/admin/tasks/${taskId}`,
      });
    }

    sendSuccess(res, comment, undefined, 201);
  }
);
