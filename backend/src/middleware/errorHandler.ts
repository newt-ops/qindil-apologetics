import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected server error occurred';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    if (err.errors) {
      const firstKey = Object.keys(err.errors)[0];
      const rawMsg = err.errors[firstKey]?.message;
      message = rawMsg ? rawMsg.replace(/^Path `.*?` is required\.?$/i, 'Please provide all required fields.') : 'Please check your input values and try again.';
    } else {
      message = 'Please check your input values and try again.';
    }
  } else if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY_ERROR';
    message = 'An item with this information already exists.';
  } else {
    console.error('Unhandled Error:', err);
    if (env.NODE_ENV === 'development') {
      message = err.message || message;
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};
