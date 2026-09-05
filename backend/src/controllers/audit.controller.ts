import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import AuditLogModel from '../models/AuditLog.model.js';
import { sendSuccess } from '../utils/apiResponse.js';

// @desc    Get paginated audit log entries for SuperAdmin
// @route   GET /api/v1/audit-log
// @access  Private (SuperAdmin)
export const listAuditLog = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const pageNum = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const { action, actor, targetType, search } = req.query;

    const queryFilter: any = {};

    if (action) {
      queryFilter.action = action;
    }

    if (actor) {
      queryFilter.actor = actor;
    }

    if (targetType) {
      queryFilter.$or = [{ targetType }, { targetModel: targetType }];
    }

    if (search) {
      queryFilter.$or = [
        { action: { $regex: search as string, $options: 'i' } },
        { targetType: { $regex: search as string, $options: 'i' } },
        { targetModel: { $regex: search as string, $options: 'i' } },
      ];
    }

    const [logs, total, availableActions, rawTargetModels] = await Promise.all([
      AuditLogModel.find(queryFilter)
        .populate('actor', 'name email avatarUrl')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      AuditLogModel.countDocuments(queryFilter),
      AuditLogModel.distinct('action'),
      AuditLogModel.distinct('targetModel'),
    ]);

    const rawTargetTypes = await AuditLogModel.distinct('targetType');
    const availableTargetModels = Array.from(
      new Set([...rawTargetModels, ...rawTargetTypes].filter(Boolean))
    );

    sendSuccess(res, {
      items: logs,
      availableActions,
      availableTargetModels,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  }
);

export default {
  listAuditLog,
};
