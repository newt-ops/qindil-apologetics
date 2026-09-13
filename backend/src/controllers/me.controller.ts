import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { UserModel } from '../models/User.model.js';
import { NotificationModel } from '../models/Notification.model.js';
import { AuditLogModel } from '../models/AuditLog.model.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';

// Helper to sanitize user object
const sanitizeUser = (user: any) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.passwordHash;
  delete userObj.otpHash;
  delete userObj.otpExpiresAt;
  return userObj;
};

// Helper to generate 6-char alphanumeric link code
const generate6CharLinkCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Get logged in user's notifications
// @route   GET /api/v1/me/notifications
export const getMyNotifications = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

    const filter = { recipient: req.user!._id };

    const total = await NotificationModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    const notifications = await NotificationModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    sendSuccess(
      res,
      notifications,
      {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    );
  }
);

// @desc    Mark notification as read
// @route   PATCH /api/v1/me/notifications/:id/read
export const markNotificationRead = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const notification = await NotificationModel.findOneAndUpdate(
      { _id: id, recipient: req.user!._id },
      { read: true },
      { new: true }
    ).lean();

    if (!notification) {
      return next(ApiError.notFound('Notification not found', 'NOT_FOUND'));
    }

    sendSuccess(res, notification);
  }
);

// @desc    Update current user profile (name, avatarUrl)
// @route   PATCH /api/v1/me/profile
export const updateMyProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, avatarUrl } = req.body;

    const updateFields: Record<string, any> = {};
    if (name !== undefined) updateFields.name = name;
    if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl;

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user!._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('roles');

    if (!updatedUser) {
      return next(ApiError.notFound('User not found', 'NOT_FOUND'));
    }

    sendSuccess(res, sanitizeUser(updatedUser));
  }
);

// @desc    Generate Telegram Link Code (valid 10 mins)
// @route   POST /api/v1/me/telegram/generate-code
export const generateTelegramLinkCode = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const code = generate6CharLinkCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await UserModel.findByIdAndUpdate(req.user!._id, {
      $set: {
        telegramLinkCode: code,
        telegramLinkCodeExpiresAt: expiresAt,
      },
    });

    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'telegram.generate_code',
      targetType: 'User',
      targetId: req.user!._id,
      metadata: { codeExpiresAt: expiresAt },
    });

    let botUsername = env.TELEGRAM_BOT_USERNAME || '';
    if (!botUsername) {
      try {
        const { getBotUsername } = await import('../telegram/bot.js');
        botUsername = await getBotUsername();
      } catch {
        botUsername = 'QindilBot';
      }
    }

    const deepLink = `https://t.me/${botUsername}?start=${code}`;

    sendSuccess(res, {
      linkCode: code,
      expiresAt,
      botUsername,
      deepLink,
    });
  }
);

// @desc    Unlink Telegram account
// @route   DELETE /api/v1/me/telegram
export const unlinkTelegram = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await UserModel.findByIdAndUpdate(req.user!._id, {
      $unset: {
        telegramChatId: 1,
        telegramLinkCode: 1,
        telegramLinkCodeExpiresAt: 1,
      },
    });

    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'telegram.unlink',
      targetType: 'User',
      targetId: req.user!._id,
    });

    sendSuccess(res, { message: 'Telegram account unlinked successfully' });
  }
);

