import { Router, Request, Response } from 'express';
import { ApiResponse, AuthMeResponse } from '@repo/shared';
import { AppDataSource } from '../data-source';
import { registerUser, loginUser } from '../services/user-auth.service';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/** POST /api/v1/store/auth/register — create a new customer account */
router.post(
  '/register',
  catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body as { username: string; password: string };

    if (!username || !password) {
      throw new AppError(400, 'VALIDATION_ERROR', 'username and password are required');
    }

    const result = await registerUser(AppDataSource, username, password);

    if (!result.success || !result.token) {
      if (result.error === 'USER_ALREADY_EXISTS') {
        throw new AppError(409, 'USER_ALREADY_EXISTS', 'Username already taken');
      }
      throw new AppError(400, 'VALIDATION_ERROR', 'Registration failed');
    }

    res.cookie('userToken', result.token, COOKIE_OPTIONS);
    const response: ApiResponse = { success: true, message: 'Registration successful' };
    res.status(201).json(response);
  }),
);

/** POST /api/v1/store/auth/login — authenticate customer */
router.post(
  '/login',
  catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body as { username: string; password: string };

    if (!username || !password) {
      throw new AppError(400, 'VALIDATION_ERROR', 'username and password are required');
    }

    const result = await loginUser(AppDataSource, username, password);

    if (!result.success || !result.token) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid credentials');
    }

    res.cookie('userToken', result.token, COOKIE_OPTIONS);
    const response: ApiResponse = { success: true, message: 'Login successful' };
    res.json(response);
  }),
);

/** POST /api/v1/store/auth/logout — clear cookie */
router.post(
  '/logout',
  catchAsync(async (req: Request, res: Response): Promise<void> => {
    res.clearCookie('userToken', COOKIE_OPTIONS);
    const response: ApiResponse = { success: true, message: 'Logged out successfully' };
    res.json(response);
  }),
);

/** GET /api/v1/store/auth/me — check authentication */
import { requireUserToken } from '../middleware/requireUserToken';
router.get(
  '/me',
  requireUserToken,
  catchAsync(async (req: Request, res: Response): Promise<void> => {
    // If requireUserToken passes, the user is authenticated.
    const response: AuthMeResponse = { authenticated: true, userId: req.user?.id };
    res.json(response);
  }),
);

export default router;
