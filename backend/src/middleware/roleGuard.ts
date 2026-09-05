import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/apiError.js';
import { resolvePermissions } from '../utils/resolvePermissions.js';

export const requirePermission = (permission: string) => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required', 'NOT_AUTHENTICATED'));
    }

    const userPermissions = resolvePermissions(req.user);

    const hasPermission =
      userPermissions.includes('*') || userPermissions.includes(permission);

    if (!hasPermission) {
      return next(
        ApiError.forbidden(
          `Forbidden: You lack the required permission [${permission}]`,
          'FORBIDDEN'
        )
      );
    }

    next();
  });
};

export const requireRole = (allowedRole: string | string[]) => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required', 'NOT_AUTHENTICATED'));
    }

    const roles = req.user.roles || [];
    const roleNames = roles.map((r: any) => (typeof r === 'string' ? r : r.name));

    // superAdmin inherits all access
    if (roleNames.includes('superAdmin')) {
      return next();
    }

    const targets = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    const hasRole = targets.some((target) => roleNames.includes(target));

    if (!hasRole) {
      return next(
        ApiError.forbidden('Forbidden: Insufficient role privileges', 'FORBIDDEN')
      );
    }

    next();
  });
};
