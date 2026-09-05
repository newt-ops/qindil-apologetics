import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { sendSuccess } from '../utils/apiResponse.js';

// Initialize Cloudinary SDK
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: env.CLOUDINARY_API_KEY || '123456789',
  api_secret: env.CLOUDINARY_API_SECRET || 'sample_secret',
});

// @desc    Get Cloudinary signed upload parameters
// @route   POST /api/v1/media/sign
// @access  Private (Admin / SuperAdmin)
export const getUploadSignature = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = req.body.folder || 'qindil/uploads';

    const cloudName = env.CLOUDINARY_CLOUD_NAME || 'demo';
    const apiKey = env.CLOUDINARY_API_KEY || '123456789';
    const apiSecret = env.CLOUDINARY_API_SECRET || 'sample_secret';

    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    sendSuccess(res, {
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  }
);
