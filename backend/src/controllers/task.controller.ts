import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { TaskModel } from '../models/Task.model.js';
import { UserModel } from '../models/User.model.js';
import { ArticleModel } from '../models/Article.model.js';
import { VideoLogModel } from '../models/VideoLog.model.js';
import { EventModel } from '../models/Event.model.js';
import { AuditLogModel } from '../models/AuditLog.model.js';
import { createNotification } from '../services/notify.js';
import { sendTelegramTaskNotification, sendTelegramTaskProgressNotification } from '../telegram/index.js';
import { sendTaskAssignedEmail } from '../services/email/index.js';
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

// @desc    Get current user's assigned tasks
// @route   GET /api/v1/tasks/mine
// @access  Private (Assignee / Admin)
export const getMyTasks = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!._id;

    const tasks = await TaskModel.find({ assignedTo: userId })
      .populate('assignedTo', 'name email avatarUrl roles')
      .populate('createdBy', 'name email avatarUrl')
      .populate('linkedArticle', 'title slug coverImageUrl status topic')
      .populate('linkedVideo', 'title videoUrl platform')
      .sort({ dueDate: 1 })
      .lean();

    const now = new Date();

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

// @desc    Create and assign a new Task (Article/Video/General)
// @route   POST /api/v1/tasks
// @access  Private (SuperAdmin or Admin)
export const createTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {
      title,
      description,
      type = 'general',
      assignedTo,
      dueDate,
      linkedArticle,
      linkedVideo,
      videoCategoryId,
      isRefutation,
      targetVideoUrl,
    } = req.body;

    if (!title || !assignedTo || !Array.isArray(assignedTo) || assignedTo.length === 0 || !dueDate) {
      return next(
        ApiError.badRequest(
          'Title, assignedTo (array of user IDs), and dueDate are required.',
          'MISSING_REQUIRED_FIELDS'
        )
      );
    }

    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return next(ApiError.badRequest('Invalid due date provided.', 'INVALID_DUE_DATE'));
    }

    // 1. Verify assignees exist and are active
    const assignees = await UserModel.find({ _id: { $in: assignedTo }, isActive: true }).populate('roles');
    if (assignees.length !== assignedTo.length) {
      return next(
        ApiError.badRequest(
          'One or more assigned users do not exist or are inactive.',
          'INVALID_ASSIGNEE'
        )
      );
    }

    const { videoType, destination } = req.body;

    if (type === 'video') {
      const vType = videoType || 'normal';
      if (vType === 'refutation' && (!targetVideoUrl || !targetVideoUrl.trim())) {
        return next(
          ApiError.badRequest(
            'Target video URL is required when video type is "refutation".',
            'MISSING_TARGET_URL'
          )
        );
      }
    }

    // 2. Create Task record with status 'pending' (VideoLog document created on accept)
    const task = new TaskModel({
      type,
      title,
      description,
      assignedTo,
      createdBy: req.user!._id,
      dueDate: dueDateObj,
      status: 'pending',
      linkedArticle: linkedArticle || undefined,
      linkedVideo: linkedVideo || undefined,
      videoType: type === 'video' ? (videoType || 'normal') : undefined,
      destination: type === 'video' ? (destination || 'official') : undefined,
      targetVideoUrl: type === 'video' ? (targetVideoUrl || undefined) : undefined,
    });

    // 3. Create linked Event (Deadline)
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

      await sendTelegramTaskNotification(assignee._id.toString(), title, type, dueDateObj);
      await sendTaskAssignedEmail(assignee.email, title, req.user?.name, type, dueDateObj);
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
      { path: 'linkedVideo', select: 'title status videoType destination targetVideoUrl posterUrl notes submittedUrl' },
    ]);

    sendSuccess(res, task, undefined, 201);
  }
);

export const assignTask = createTask;

// @desc    Accept & Start an assigned Task (creates Article draft for article tasks)
// @route   PATCH /api/v1/tasks/:id/accept
// @access  Private (Assignees only)
export const acceptTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const task = await TaskModel.findById(id);

    if (!task) {
      return next(ApiError.notFound('Task not found', 'NOT_FOUND'));
    }

    const callerId = req.user!._id.toString();
    const isAssignee = task.assignedTo.some((uid) => uid.toString() === callerId);

    if (!isAssignee) {
      return next(
        ApiError.forbidden('Only an assigned team member can accept this task.', 'FORBIDDEN')
      );
    }

    if (task.status !== 'pending') {
      return next(
        ApiError.conflict(
          `Task cannot be accepted because its status is already "${task.status}".`,
          'TASK_NOT_PENDING'
        )
      );
    }

    // Update status to inProgress
    task.status = 'inProgress';

    // If article task and no linked article draft exists, create the Article now!
    if (task.type === 'article' && !task.linkedArticle) {
      let articleSlug = slugify(task.title);
      const existingSlug = await ArticleModel.findOne({ slug: articleSlug });
      if (existingSlug) {
        articleSlug = `${articleSlug}-${Date.now().toString(36)}`;
      }

      const article = await ArticleModel.create({
        title: task.title,
        slug: articleSlug,
        author: req.user!._id,
        status: 'draft',
        linkedTaskId: task._id,
      });

      task.linkedArticle = article._id as any;
    }

    // If video task and no linked VideoLog exists, create the VideoLog now!
    if (task.type === 'video' && !task.linkedVideo) {
      const videoLog = await VideoLogModel.create({
        title: task.title,
        creator: req.user!._id,
        videoType: task.videoType || 'normal',
        destination: task.destination || 'official',
        targetVideoUrl: task.targetVideoUrl || undefined,
        status: 'inProgress',
        linkedTaskId: task._id,
      });

      task.linkedVideo = videoLog._id as any;
    }

    await task.save();

    // Audit log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'task.accept',
      targetType: 'Task',
      targetId: task._id,
      metadata: {
        taskTitle: task.title,
        taskType: task.type,
        linkedArticleId: task.linkedArticle,
        linkedVideoId: task.linkedVideo,
      },
    });

    await task.populate([
      { path: 'assignedTo', select: 'name email avatarUrl' },
      { path: 'createdBy', select: 'name email' },
      { path: 'linkedArticle', select: 'title slug status coverImageUrl' },
      { path: 'linkedVideo', select: 'title status videoType destination targetVideoUrl posterUrl notes submittedUrl' },
    ]);

    sendSuccess(res, task);
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

    // If status is moved out of pending to inProgress for an article task, ensure Article draft exists
    if (newStatus === 'inProgress' && task.type === 'article' && !task.linkedArticle) {
      let articleSlug = slugify(task.title);
      const existingSlug = await ArticleModel.findOne({ slug: articleSlug });
      if (existingSlug) {
        articleSlug = `${articleSlug}-${Date.now().toString(36)}`;
      }

      const article = await ArticleModel.create({
        title: task.title,
        slug: articleSlug,
        author: req.user!._id,
        status: 'draft',
        linkedTaskId: task._id,
      });

      task.linkedArticle = article._id as any;
    }

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

    // Notify assignees if superAdmin updated status
    if (isSuperAdmin && !isAssignee) {
      for (const assigneeId of task.assignedTo) {
        await sendTelegramTaskProgressNotification(
          assigneeId.toString(),
          task.title,
          newStatus === 'done' ? 'approved' : 'changes_requested',
          `Task status updated from "${currentStatus}" to "${newStatus}".`
        );
      }
    }

    await task.populate([
      { path: 'assignedTo', select: 'name email avatarUrl' },
      { path: 'createdBy', select: 'name email' },
      { path: 'linkedArticle', select: 'title slug status' },
      { path: 'linkedVideo', select: 'title boardStage' },
    ]);

    sendSuccess(res, task);
  }
);
