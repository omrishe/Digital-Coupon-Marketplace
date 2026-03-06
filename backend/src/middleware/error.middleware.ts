import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ApiErrorResponse } from '@repo/shared';

/**
 * Global error handling middleware.
 * All errors thrown in async routes (wrapped with catchAsync) or passed via next(err)
 * will end up here.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // If the error is an instance of AppError, or has the expected properties (duck-typing)
  if (err instanceof AppError || (err.statusCode && err.error_code)) {
    console.error('[errorHandler] Handled AppError:', err);
    const response: ApiErrorResponse = {
      error_code: err.error_code,
      message: err.message,
    };
    return res.status(err.statusCode).json(response);
  }

  // General unhandled errors (e.g., Syntax errors, database connection issues, etc.)
  console.error('Unhandled Server Error:', err);

  const response: ApiErrorResponse = {
    error_code: 'INTERNAL_ERROR',
    message: err.message || 'An unexpected internal error occurred.',
  };
  return res.status(500).json(response);
};
