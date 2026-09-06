import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { UserModel } from '../models/User.model.js';
import { RoleModel } from '../models/Role.model.js';
import { AuditLogModel } from '../models/AuditLog.model.js';
import { createNotification } from '../services/notify.js';
import { sendTelegramRoleChangeNotification } from '../telegram/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

// Helper to sanitize user output
const sanitizeUser = (user: any) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  delete obj.otpHash;
  delete obj.otpExpiresAt;
  return obj;
};

// @desc    List team members (or all users if includeUsers=true)
// @route   GET /api/v1/team
// @access  Private (SuperAdmin only)
export const listTeam = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const search = (req.query.search as string || '').trim();
    const roleFilter = (req.query.role as string || '').trim();
    const includeUsers = req.query.includeUsers === 'true';

    // Find role ObjectIds for filtering
    const adminRole = await RoleModel.findOne({ name: 'admin' });
    const superAdminRole = await RoleModel.findOne({ name: 'superAdmin' });
    const userRole = await RoleModel.findOne({ name: 'user' });

    const filter: Record<string, any> = {};

    // Search query on name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Role filtering logic
    if (roleFilter) {
      const selectedRoleDoc = await RoleModel.findOne({ name: roleFilter });
      if (selectedRoleDoc) {
        filter.roles = selectedRoleDoc._id;
      }
    } else if (!includeUsers) {
      // By default (without includeUsers=true), only show actual team members (admin + superAdmin)
      const teamRoleIds = [adminRole?._id, superAdminRole?._id].filter(Boolean);
      filter.roles = { $in: teamRoleIds };
    }

    const total = await UserModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    const users = await UserModel.find(filter)
      .populate('roles')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const sanitizedUsers = users.map(sanitizeUser);

    sendSuccess(res, sanitizedUsers, {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  }
);

// @desc    Get detailed team member profile
// @route   GET /api/v1/team/:id
// @access  Private (SuperAdmin only)
export const getTeamMember = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const user = await UserModel.findById(id).populate('roles');

    if (!user) {
      return next(ApiError.notFound('Member not found', 'NOT_FOUND'));
    }

    sendSuccess(res, sanitizeUser(user));
  }
);

// @desc    Update team member role (user, admin, superAdmin)
// @route   PATCH /api/v1/team/:id/role
// @access  Private (SuperAdmin only)
export const updateMemberRole = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { role: newRoleName } = req.body;

    const targetUser = await UserModel.findById(id).populate('roles');

    if (!targetUser) {
      return next(ApiError.notFound('Member not found', 'NOT_FOUND'));
    }

    const targetRoleDoc = await RoleModel.findOne({ name: newRoleName });
    if (!targetRoleDoc) {
      return next(ApiError.badRequest(`Invalid role: ${newRoleName}`, 'INVALID_ROLE'));
    }

    const superAdminRole = await RoleModel.findOne({ name: 'superAdmin' });

    // Check if target user is currently a superAdmin
    const isTargetSuperAdmin = targetUser.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    // Guard: Prevent demoting the last remaining active superAdmin
    if (isTargetSuperAdmin && newRoleName !== 'superAdmin' && superAdminRole) {
      const superAdminCount = await UserModel.countDocuments({
        roles: superAdminRole._id,
        isActive: true,
      });

      if (superAdminCount <= 1) {
        return next(
          ApiError.conflict(
            'Cannot demote the last remaining Super Admin account.',
            'LAST_SUPERADMIN'
          )
        );
      }
    }

    const currentRoleName = targetUser.roles[0]
      ? typeof targetUser.roles[0] === 'string'
        ? targetUser.roles[0]
        : (targetUser.roles[0] as any).name
      : 'user';

    // Assign new role
    targetUser.roles = [targetRoleDoc._id] as any;
    await targetUser.save();

    // Re-populate roles for response
    await targetUser.populate('roles');

    // Audit log entry
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'role.update',
      targetType: 'User',
      targetId: targetUser._id,
      metadata: {
        previousRole: currentRoleName,
        newRole: newRoleName,
      },
    });

    // Send notification to the affected user
    await createNotification({
      recipient: targetUser._id as any,
      type: 'system',
      title: 'Account Role Updated',
      body: `Your Qindil account role has been updated to "${newRoleName}".`,
      link: '/dashboard',
    });

    // Send Telegram role notification (congratulatory on promotion, respectful on demotion)
    await sendTelegramRoleChangeNotification(
      targetUser._id.toString(),
      currentRoleName,
      newRoleName
    );

    sendSuccess(res, sanitizeUser(targetUser));
  }
);

// @desc    Deactivate or reactivate a team member
// @route   PATCH /api/v1/team/:id/status
// @access  Private (SuperAdmin only)
export const updateMemberStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { isActive } = req.body;

    const targetUser = await UserModel.findById(id).populate('roles');

    if (!targetUser) {
      return next(ApiError.notFound('Member not found', 'NOT_FOUND'));
    }

    const superAdminRole = await RoleModel.findOne({ name: 'superAdmin' });
    const isTargetSuperAdmin = targetUser.roles.some((r: any) =>
      typeof r === 'string' ? r === 'superAdmin' : r.name === 'superAdmin'
    );

    // Guard: Prevent deactivating the last active superAdmin
    if (!isActive && isTargetSuperAdmin && superAdminRole) {
      const superAdminCount = await UserModel.countDocuments({
        roles: superAdminRole._id,
        isActive: true,
      });

      if (superAdminCount <= 1) {
        return next(
          ApiError.conflict(
            'Cannot deactivate the last remaining Super Admin account.',
            'LAST_SUPERADMIN'
          )
        );
      }
    }

    targetUser.isActive = isActive;
    await targetUser.save();

    // Audit log entry
    await AuditLogModel.create({
      actor: req.user!._id,
      action: isActive ? 'user.reactivate' : 'user.deactivate',
      targetType: 'User',
      targetId: targetUser._id,
      metadata: { isActive },
    });

    sendSuccess(res, sanitizeUser(targetUser));
  }
);
