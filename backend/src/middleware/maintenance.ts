import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import SiteSettingsModel from '../models/SiteSettings.model.js';
import { UserModel } from '../models/User.model.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';

export const checkMaintenance = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    // If DB is disconnected, bypass maintenance check gracefully
    if (mongoose.connection.readyState !== 1) {
      return next();
    }

    // Query site settings singleton
    const settings = await SiteSettingsModel.findOne().lean();
    if (!settings || !settings.maintenanceMode) {
      return next();
    }

    // Maintenance mode is active. Check for exempt public routes:
    const path = req.path;
    const isExemptRoute =
      path === '/api/v1/health' ||
      path === '/health' ||
      path === '/robots.txt' ||
      path === '/sitemap.xml' ||
      path.startsWith('/api/v1/settings') ||
      path.startsWith('/api/v1/auth');

    if (isExemptRoute) {
      return next();
    }

    // Check if caller provides a valid Bearer token for admin or superAdmin
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const user = await UserModel.findById(decoded.userId).populate('roles');
        if (user && user.isActive) {
          const isAdminOrSuperAdmin = user.roles.some((r: any) => {
            const name = typeof r === 'string' ? r : r.name;
            return name === 'admin' || name === 'superAdmin';
          });

          if (isAdminOrSuperAdmin) {
            req.user = user;
            return next();
          }
        }
      } catch {
        // Token invalid or expired, continue to block with maintenance error
      }
    }

    // Public / non-admin caller blocked during maintenance
    return next(
      new ApiError(
        503,
        'System is currently undergoing scheduled maintenance. Please try again shortly.',
        'MAINTENANCE_MODE'
      )
    );
  } catch (_error) {
    // Fail-open on unexpected error to avoid taking down entire platform
    next();
  }
};

