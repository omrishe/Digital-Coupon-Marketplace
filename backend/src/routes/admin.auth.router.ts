import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { registerAdmin, loginAdmin } from '../services/admin-auth.service';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

/** POST /admin/auth/register, create the first admin account */
router.post(
  '/register',
  catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body as { username: string; password: string };

    if (!username || !password) {
      throw new AppError(400, 'VALIDATION_ERROR', 'username and password are required');
    }

    const result = await registerAdmin(AppDataSource, username, password);

    if (!result.success) {
      if (result.error === 'USER_ALREADY_EXISTS') {
        throw new AppError(409, 'USER_ALREADY_EXISTS', 'Username already taken');
      }
      throw new AppError(400, 'VALIDATION_ERROR', 'Registration failed');
    }

    res.status(201).json({ token: result.token });
  }),
);

/** POST /admin/auth/login, get a JWT for an existing admin */
router.post(
  '/login',
  catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body as { username: string; password: string };

    if (!username || !password) {
      throw new AppError(400, 'VALIDATION_ERROR', 'username and password are required');
    }

    const result = await loginAdmin(AppDataSource, username, password);

    if (!result.success) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid credentials');
    }

    res.json({ token: result.token });
  }),
);

export default router;
