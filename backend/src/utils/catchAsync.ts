import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async route handlers to automatically pass thrown errors to Express `next()`.
 * This is necessary in Express 4 which does not handle Promise rejections by default.
 * basically a trick to make async functions work with Express
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
