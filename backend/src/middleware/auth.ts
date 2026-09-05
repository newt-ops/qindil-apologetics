import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { UserModel } from '../models/User.model.js';

export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Not authorized, missing access token', 'NO_TOKEN'));
    }

    try {
      const decoded = verifyAccessToken(token);

      const user = await UserModel.findById(decoded.userId).populate('roles');

      if (!user) {
        return next(ApiError.unauthorized('User not found', 'USER_NOT_FOUND'));
      }

      if (!user.isActive) {
        return next(
          ApiError.unauthorized('Account has been deactivated', 'ACCOUNT_DEACTIVATED')
        );
      }

      req.user = user;
      next();
    } catch (error) {
      return next(ApiError.unauthorized('Token expired or invalid', 'INVALID_TOKEN'));
    }
  }
);
