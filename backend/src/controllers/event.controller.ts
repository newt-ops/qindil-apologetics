import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import EventModel from '../models/Event.model.js';
import TaskModel from '../models/Task.model.js';
import AuditLogModel from '../models/AuditLog.model.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

// @desc    Get team calendar events for the authenticated admin/superAdmin
// @route   GET /api/v1/events/mine
// @access  Private (Admin & SuperAdmin)
export const listMyCalendarEvents = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!._id;
    const isSuperAdmin = req.user!.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    // Read date range parameters (default to current month)
    const { from, to } = req.query;

    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const startDateFrom = from ? new Date(from as string) : defaultFrom;
    const startDateTo = to ? new Date(to as string) : defaultTo;

    // Date range filter
    const dateQuery = {
      startDate: {
        $gte: startDateFrom,
        $lte: startDateTo,
      },
      visibility: 'team',
    };

    let events;

    if (isSuperAdmin) {
      // SuperAdmin sees all team events within date range
      events = await EventModel.find(dateQuery)
        .populate({
          path: 'relatedTask',
          select: 'title type status dueDate assignedTo createdBy',
        })
        .sort({ startDate: 1 });
    } else {
      // Regular admin sees:
      // 1. Team events with no related task (general team calendar events)
      // 2. Team events linked to tasks assigned to or created by caller
      const myTaskIds = await TaskModel.find({
        $or: [{ assignedTo: userId }, { createdBy: userId }],
      }).distinct('_id');

      const adminQuery = {
        ...dateQuery,
        $or: [
          { relatedTask: { $exists: false } },
          { relatedTask: null },
          { relatedTask: { $in: myTaskIds } },
        ],
      };

      events = await EventModel.find(adminQuery)
        .populate({
          path: 'relatedTask',
          select: 'title type status dueDate assignedTo createdBy',
        })
        .sort({ startDate: 1 });
    }

    sendSuccess(res, events);
  }
);

// @desc    List all events for SuperAdmin with optional filters & pagination
// @route   GET /api/v1/events
// @access  Private (SuperAdmin)
export const listEventsAdmin = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const pageNum = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const { type, visibility, search } = req.query;

    const queryFilter: any = {};
    if (type) queryFilter.type = type;
    if (visibility) queryFilter.visibility = visibility;
    if (search) {
      queryFilter.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
        { location: { $regex: search as string, $options: 'i' } },
      ];
    }

    const [events, total] = await Promise.all([
      EventModel.find(queryFilter)
        .populate({
          path: 'relatedTask',
          select: 'title type status dueDate',
        })
        .sort({ startDate: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      EventModel.countDocuments(queryFilter),
    ]);

    sendSuccess(res, {
      items: events,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  }
);

// @desc    Create a new event
// @route   POST /api/v1/events
// @access  Private (SuperAdmin)
export const createEvent = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { title, description, startDate, endDate, allDay, type, visibility, location } = req.body;

    const event = await EventModel.create({
      title,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      allDay: allDay !== undefined ? allDay : true,
      type,
      visibility,
      location,
    });

    // Record Audit Log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'event.create',
      targetModel: 'Event',
      targetId: event._id,
      details: { title: event.title, visibility: event.visibility, type: event.type },
    });

    sendSuccess(res, event, undefined, 201);
  }
);

// @desc    Update an existing event
// @route   PATCH /api/v1/events/:id
// @access  Private (SuperAdmin)
export const updateEvent = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { title, description, startDate, endDate, allDay, type, visibility, location } = req.body;

    const event = await EventModel.findById(id);
    if (!event) {
      return next(ApiError.notFound('Event not found', 'NOT_FOUND'));
    }

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (startDate !== undefined) event.startDate = new Date(startDate);
    if (endDate !== undefined) event.endDate = endDate ? new Date(endDate) : undefined;
    if (allDay !== undefined) event.allDay = allDay;
    if (type !== undefined) event.type = type;
    if (visibility !== undefined) event.visibility = visibility;
    if (location !== undefined) event.location = location;

    if (event.endDate && event.endDate < event.startDate) {
      return next(
        ApiError.badRequest('End date must be greater than or equal to start date', 'INVALID_DATES')
      );
    }

    await event.save();

    // Write Audit Log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'event.update',
      targetModel: 'Event',
      targetId: event._id,
      details: { title: event.title, visibility: event.visibility },
    });

    sendSuccess(res, event);
  }
);

// @desc    Delete an event (blocks task-linked events)
// @route   DELETE /api/v1/events/:id
// @access  Private (SuperAdmin)
export const deleteEvent = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const event = await EventModel.findById(id);
    if (!event) {
      return next(ApiError.notFound('Event not found', 'NOT_FOUND'));
    }

    // Task-linked events cannot be deleted from event management
    if (event.relatedTask) {
      return next(
        ApiError.badRequest(
          'Task-linked events cannot be deleted directly.',
          'TASK_LINKED_EVENT'
        )
      );
    }

    await EventModel.findByIdAndDelete(id);

    // Write Audit Log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'event.delete',
      targetModel: 'Event',
      targetId: event._id,
      details: { title: event.title },
    });

    sendSuccess(res, { message: 'Event deleted successfully.' });
  }
);

export default {
  listMyCalendarEvents,
  listEventsAdmin,
  createEvent,
  updateEvent,
  deleteEvent,
};
