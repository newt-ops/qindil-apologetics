import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/apiError.js';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const shape = (schema as any)._def?.shape;
      const hasBodyKey = shape && shape.body !== undefined;
      const hasQueryKey = shape && shape.query !== undefined;
      const hasParamsKey = shape && shape.params !== undefined;

      if (hasBodyKey || hasQueryKey || hasParamsKey) {
        const parsed = schema.parse({
          body: req.body,
          query: req.query,
          params: req.params,
        }) as any;
        if (parsed.body !== undefined) req.body = parsed.body;
        if (parsed.query !== undefined) req.query = parsed.query;
        if (parsed.params !== undefined) req.params = parsed.params;
      } else {
        req.body = schema.parse(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => {
          const path = err.path.filter((p) => p !== 'body').join('.');
          return path ? `${path}: ${err.message}` : err.message;
        });
        return next(
          new ApiError(
            400,
            formattedErrors.join('; '),
            'VALIDATION_ERROR'
          )
        );
      }
      next(error);
    }
  };
};

