import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import ContactMessageModel from '../models/ContactMessage.model.js';
import AuditLogModel from '../models/AuditLog.model.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

// @desc    List contact messages for SuperAdmin
// @route   GET /api/v1/contact-messages
// @access  Private (SuperAdmin)
export const listContactMessages = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const pageNum = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const { status, search } = req.query;

    const queryFilter: any = {};

    if (status && status !== 'all') {
      queryFilter.status = status;
    } else if (!status) {
      // Default to non-archived messages
      queryFilter.status = { $ne: 'archived' };
    }

    if (search) {
      queryFilter.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } },
        { subject: { $regex: search as string, $options: 'i' } },
        { message: { $regex: search as string, $options: 'i' } },
      ];
    }

    const [messages, total, unreadCount] = await Promise.all([
      ContactMessageModel.find(queryFilter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      ContactMessageModel.countDocuments(queryFilter),
      ContactMessageModel.countDocuments({ status: 'new' }),
    ]);

    sendSuccess(res, {
      items: messages,
      unreadCount,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  }
);

// @desc    Get single contact message (Side-effect: marks 'new' -> 'read')
// @route   GET /api/v1/contact-messages/:id
// @access  Private (SuperAdmin)
export const getContactMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const message = await ContactMessageModel.findById(id);
    if (!message) {
      return next(ApiError.notFound('Contact message not found', 'NOT_FOUND'));
    }

    // Side-effect: Mark 'new' status as 'read' upon viewing
    if (message.status === 'new') {
      message.status = 'read';
      await message.save();

      // Audit Log
      await AuditLogModel.create({
        actor: req.user!._id,
        action: 'contactMessage.read',
        targetModel: 'ContactMessage',
        targetId: message._id,
        details: { email: message.email, subject: message.subject },
      });
    }

    const unreadCount = await ContactMessageModel.countDocuments({ status: 'new' });

    sendSuccess(res, {
      message,
      unreadCount,
    });
  }
);

// @desc    Archive a contact message
// @route   PATCH /api/v1/contact-messages/:id/archive
// @access  Private (SuperAdmin)
export const archiveContactMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const message = await ContactMessageModel.findById(id);
    if (!message) {
      return next(ApiError.notFound('Contact message not found', 'NOT_FOUND'));
    }

    message.status = 'archived';
    await message.save();

    // Write Audit Log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'contactMessage.archive',
      targetModel: 'ContactMessage',
      targetId: message._id,
      details: { email: message.email, subject: message.subject },
    });

    const unreadCount = await ContactMessageModel.countDocuments({ status: 'new' });

    sendSuccess(res, {
      message,
      unreadCount,
    });
  }
);

export default {
  listContactMessages,
  getContactMessage,
  archiveContactMessage,
};
