import { Response } from 'express';

export interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: any;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  meta?: ApiResponseMeta,
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
};
