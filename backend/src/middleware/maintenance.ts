import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import SiteSettingsModel from '../models/SiteSettings.model.js';
import { ApiError } from '../utils/apiError.js';

export const checkMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const path = req.path;
    const isExcluded =
      path === '/' ||
      path.startsWith('/api/v1/auth') ||
      path.startsWith('/api/v1/me') ||
      path.startsWith('/api/v1/settings') ||
      path.startsWith('/api/v1/team') ||
      path.startsWith('/api/v1/tasks') ||
      path.startsWith('/api/v1/events') ||
      path.startsWith('/api/v1/topics') ||
      path.startsWith('/api/v1/articles') ||
      path.startsWith('/api/v1/videos') ||
      path.startsWith('/api/v1/analytics') ||
      path.startsWith('/api/v1/contact-messages') ||
      path.startsWith('/api/v1/audit-log') ||
      path.startsWith('/api/v1/health');

    if (isExcluded) {
      return next();
    }

    // Check if caller is authenticated as admin or superAdmin
    if (req.user) {
      const isAdminOrSuperAdmin = req.user.roles.some((r: any) => {
        const name = typeof r === 'string' ? r : r.name;
        return name === 'admin' || name === 'superAdmin';
      });
      if (isAdminOrSuperAdmin) {
        return next();
      }
    }

    // If DB is disconnected, bypass maintenance check gracefully
    if (mongoose.connection.readyState !== 1) {
      return next();
    }

    // Query site settings singleton
    const settings = await SiteSettingsModel.findOne().lean();
    if (settings && settings.maintenanceMode) {
      return next(
        new ApiError(
          503,
          'System is currently undergoing scheduled maintenance. Please try again shortly.',
          'MAINTENANCE_MODE'
        )
      );
    }

    next();
  } catch (_error) {
    // Fail-open on maintenance check DB error to avoid crashing routes
    next();
  }
};
