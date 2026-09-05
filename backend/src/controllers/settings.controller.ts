import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import SiteSettingsModel from '../models/SiteSettings.model.js';
import AuditLogModel from '../models/AuditLog.model.js';
import { sendSuccess } from '../utils/apiResponse.js';

// @desc    Get site settings singleton (Public access)
// @route   GET /api/v1/settings
// @access  Public
export const getSettings = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    let settings = await SiteSettingsModel.findOne();

    if (!settings) {
      // Create singleton document with default values on first read
      settings = await SiteSettingsModel.create({
        siteName: 'Qindil Platform',
        tagline: 'Islamic Apologetics & Intellectual Research',
        contactEmail: 'contact@qindilapologetics.com',
        socialLinks: {
          facebook: 'https://facebook.com',
          youtube: 'https://youtube.com',
          telegram: 'https://t.me',
          instagram: 'https://instagram.com',
          tiktok: 'https://tiktok.com',
        },
        maintenanceMode: false,
      });
    }

    sendSuccess(res, settings);
  }
);

// @desc    Update site settings singleton (SuperAdmin only)
// @route   PATCH /api/v1/settings
// @access  Private (SuperAdmin)
export const updateSettings = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { siteName, tagline, contactEmail, socialLinks, maintenanceMode } = req.body;

    let settings = await SiteSettingsModel.findOne();

    if (!settings) {
      settings = new SiteSettingsModel({
        siteName: siteName || 'Qindil Platform',
        tagline: tagline || 'Islamic Apologetics & Intellectual Research',
        contactEmail: contactEmail || 'contact@qindilapologetics.com',
        socialLinks: socialLinks || {},
        maintenanceMode: Boolean(maintenanceMode),
      });
    } else {
      if (siteName !== undefined) settings.siteName = siteName;
      if (tagline !== undefined) settings.tagline = tagline;
      if (contactEmail !== undefined) settings.contactEmail = contactEmail;
      if (socialLinks !== undefined) {
        settings.socialLinks = {
          ...settings.socialLinks,
          ...socialLinks,
        };
      }
      if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    }

    await settings.save();

    // Write Audit Log
    await AuditLogModel.create({
      actor: req.user!._id,
      action: 'settings.update',
      targetModel: 'SiteSettings',
      targetId: settings._id,
      details: {
        siteName: settings.siteName,
        maintenanceMode: settings.maintenanceMode,
      },
    });

    sendSuccess(res, settings);
  }
);

export default {
  getSettings,
  updateSettings,
};
