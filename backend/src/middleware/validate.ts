import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/apiError.js';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
        return next(
          new ApiError(
            400,
            `Validation error: ${formattedErrors.join('; ')}`,
            'VALIDATION_ERROR'
          )
        );
      }
      next(error);
    }
  };
};
