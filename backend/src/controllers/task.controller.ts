import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { TaskModel } from '../models/Task.model.js';
import { UserModel } from '../models/User.model.js';
import { ArticleModel } from '../models/Article.model.js';
import { VideoLogModel } from '../models/VideoLog.model.js';
import { EventModel } from '../models/Event.model.js';
import { AuditLogModel } from '../models/AuditLog.model.js';
import { createNotification } from '../services/notify.js';
import { sendTelegramTaskNotification } from '../services/telegram.js';
import { sendTaskAssignedEmail } from '../services/email.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

// Helper to generate URL-safe slugs
function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${randomSuffix}`;
}

// @desc    Get current user's assigned tasks
// @route   GET /api/v1/tasks/mine
// @access  Private (Admin / SuperAdmin)
export const getMyTasks = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!._id;

    // Find tasks assigned to this user, sorted by dueDate ascending
    const tasks = await TaskModel.find({ assignedTo: userId })
      .populate('linkedArticle', 'title slug coverImageUrl status')
      .populate('linkedVideo', 'title videoUrl platform')
      .sort({ dueDate: 1 })
      .lean();

    const now = new Date();

    // Map tasks to update overdue status dynamically if past dueDate and not completed
    const processedTasks = tasks.map((task) => {
      const isOverdue = new Date(task.dueDate) < now && task.status !== 'done';
      return {
        ...task,
        status: isOverdue ? 'overdue' : task.status,
        isOverdue,
      };
    });

    sendSuccess(res, processedTasks);
  }
);

// @desc    Get single task detail by ID
// @route   GET /api/v1/tasks/:id
// @access  Private (Task Assignees, Creator, or SuperAdmin)
export const getTaskById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const task = await TaskModel.findById(id)
      .populate('assignedTo', 'name email avatarUrl roles')
      .populate('createdBy', 'name email avatarUrl')
      .populate('linkedArticle', 'title slug coverImageUrl status topic')
      .populate('linkedVideo', 'title boardStage videoUrl platform')
      .populate('calendarEventId', 'title startDate type visibility');

    if (!task) {
      return next(ApiError.notFound('Task not found', 'NOT_FOUND'));
    }

    const callerId = req.user!._id.toString();
    const isAssignee = task.assignedTo.some((u: any) =>
      typeof u === 'string' ? u === callerId : u._id.toString() === callerId
    );
    const isCreator = task.createdBy
      ? typeof task.createdBy === 'string'
        ? task.createdBy === callerId
        : (task.createdBy as any)._id.toString() === callerId
      : false;
    const isSuperAdmin = req.user!.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    if (!isAssignee && !isCreator && !isSuperAdmin) {
      return next(
        ApiError.forbidden('You do not have permission to view this task.', 'FORBIDDEN')
      );
    }

    const now = new Date();
    const isOverdue = new Date(task.dueDate) < now && task.status !== 'done';

    const processedTask = {
      ...task.toObject(),
      status: isOverdue ? 'overdue' : task.status,
      isOverdue,
    };

    sendSuccess(res, processedTask);
  }
);

// @desc    Assign a new task to team members
// @route   POST /api/v1/tasks
// @access  Private (SuperAdmin only)
export const assignTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {
      type,
      title,
      description,
      assignedTo,
      dueDate,
      topicId,
      articleTitle,
      videoCategoryId,
      isRefutation,
      targetVideoUrl,
    } = req.body;

    // 1. Verify assignees
    const assignees = await UserModel.find({ _id: { $in: assignedTo }, isActive: true }).populate('roles');

    if (assignees.length !== assignedTo.length) {
      const foundIds = assignees.map((u) => u._id.toString());
      const missingIds = assignedTo.filter((id: string) => !foundIds.includes(id));
      return next(
        ApiError.badRequest(
          `Invalid or inactive assignee IDs provided: ${missingIds.join(', ')}`,
          'INVALID_ASSIGNEES'
        )
      );
    }

    // Verify all assignees have role 'admin' or 'superAdmin'
    for (const assignee of assignees) {
      const roleNames = assignee.roles.map((r: any) => (typeof r === 'string' ? r : r.name));
      const hasAdminRank = roleNames.includes('admin') || roleNames.includes('superAdmin');
      if (!hasAdminRank) {
        return next(
          ApiError.badRequest(
            `User "${assignee.name}" (${assignee.email}) does not have admin/superAdmin privileges.`,
            'NOT_ADMIN'
          )
        );
      }
    }

    const dueDateObj = new Date(dueDate);

    // 2. Create base Task document
    const task = new TaskModel({
      type,
      title,
      description,
      assignedTo,
      createdBy: req.user!._id,
      dueDate: dueDateObj,
      status: 'pending',
    });

    // 3. Handle linked resource creation based on type
    if (type === 'video') {
      const videoLog = await VideoLogModel.create({
        title,
        category: videoCategoryId || undefined,
        isRefutation: Boolean(isRefutation),
        targetVideoUrl,
        contentCreator: assignedTo[0],
        editor: assignedTo[1] || assignedTo[0],
        task: task._id,
        boardStage: 'idea',
        stageHistory: [
          {
            stage: 'idea',
            movedBy: req.user!._id,
            movedAt: new Date(),
          },
        ],
      });
      task.linkedVideo = videoLog._id as any;
    } else if (type === 'article') {
      const articleTitleText = articleTitle || title;
      const articleSlug = slugify(articleTitleText);
      const article = await ArticleModel.create({
        title: articleTitleText,
        slug: articleSlug,
        topic: topicId || undefined,
        author: assignedTo[0],
        status: 'draft',
        linkedTaskId: task._id,
      });
      task.linkedArticle = article._id as any;
    }

    // 4. Create linked Event (Deadline)
    const deadlineEvent = await EventModel.create({
      title: `[Deadline] ${title}`,
      description: description || `Task deadline for: ${title}`,
      startDate: dueDateObj,
      allDay: true,
      type: 'deadline',
      visibility: 'team',
      relatedTask: task._id,
    });
    task.calendarEventId = deadlineEvent._id as any;

    await task.save();

    // 5. Trigger notifications for assignees
    for (const assignee of assignees) {
      await createNotification({
        recipient: assignee._id as any,
        type: 'task_assigned',
        title: 'New Task Assigned',
        body: `You have been assigned to: "${title}" (Due: ${dueDateObj.toLocaleDateString()})`,
        link: '/admin/workspace',
      });

      await sendTelegramTaskNotification(assignee._id.toString(), title);
      await sendTaskAssignedEmail(assignee.email, title);
    }

    // 6. Audit log entry
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'task.assign',
      targetType: 'Task',
      targetId: task._id,
      metadata: {
        title,
        type,
        assignedTo,
        dueDate,
      },
    });

    // 7. Populate & return task
    await task.populate([
      { path: 'assignedTo', select: 'name email avatarUrl' },
      { path: 'createdBy', select: 'name email' },
      { path: 'linkedArticle', select: 'title slug status' },
      { path: 'linkedVideo', select: 'title boardStage' },
    ]);

    sendSuccess(res, task, undefined, 201);
  }
);

// @desc    List all tasks with filtering & pagination
// @route   GET /api/v1/tasks
// @access  Private (SuperAdmin only)
export const listTasks = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const status = (req.query.status as string || '').trim();
    const type = (req.query.type as string || '').trim();
    const assignee = (req.query.assignee as string || '').trim();

    const filter: Record<string, any> = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (assignee) filter.assignedTo = assignee;

    const total = await TaskModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    const tasks = await TaskModel.find(filter)
      .populate('assignedTo', 'name email avatarUrl')
      .populate('createdBy', 'name email')
      .populate('linkedArticle', 'title slug status')
      .populate('linkedVideo', 'title boardStage')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const now = new Date();
    const processedTasks = tasks.map((t) => {
      const isOverdue = new Date(t.dueDate) < now && t.status !== 'done';
      return {
        ...t,
        status: isOverdue ? 'overdue' : t.status,
        isOverdue,
      };
    });

    sendSuccess(res, processedTasks, {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  }
);

// @desc    Update task status (pending -> inProgress -> inReview -> done)
// @route   PATCH /api/v1/tasks/:id/status
// @access  Private (Assignee or SuperAdmin)
export const updateTaskStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    const task = await TaskModel.findById(id);

    if (!task) {
      return next(ApiError.notFound('Task not found', 'NOT_FOUND'));
    }

    const callerId = req.user!._id.toString();
    const isAssignee = task.assignedTo.some((uid) => uid.toString() === callerId);
    const isSuperAdmin = req.user!.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    if (!isAssignee && !isSuperAdmin) {
      return next(
        ApiError.forbidden('Only assigned team members or superAdmins can update task status.', 'FORBIDDEN')
      );
    }

    const currentStatus = task.status;

    // Validate legal status transition sequence (unless superAdmin override)
    const validTransitions: Record<string, string[]> = {
      pending: ['inProgress', 'inReview', 'done'],
      inProgress: ['inReview', 'done', 'pending'],
      inReview: ['done', 'inProgress', 'pending'],
      done: ['inReview', 'inProgress'],
      overdue: ['inProgress', 'inReview', 'done'],
    };

    if (!isSuperAdmin && validTransitions[currentStatus] && !validTransitions[currentStatus].includes(newStatus)) {
      return next(
        ApiError.badRequest(
          `Invalid status transition from "${currentStatus}" to "${newStatus}".`,
          'INVALID_TRANSITION'
        )
      );
    }

    task.status = newStatus;
    await task.save();

    // Audit log entry
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'task.status_update',
      targetType: 'Task',
      targetId: task._id,
      metadata: {
        previousStatus: currentStatus,
        newStatus,
      },
    });

    await task.populate([
      { path: 'assignedTo', select: 'name email avatarUrl' },
      { path: 'createdBy', select: 'name email' },
      { path: 'linkedArticle', select: 'title slug status' },
      { path: 'linkedVideo', select: 'title boardStage' },
    ]);

    sendSuccess(res, task);
  }
);
