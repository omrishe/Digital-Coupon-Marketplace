import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserJwtPayload } from '../services/user-auth.service';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { AppError } from '../utils/AppError';

/**
 * Validates the userToken cookie and attaches the user entity to req.user
 */
export const requireUserToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.userToken;

    if (!token) {
      throw new AppError(401, 'UNAUTHORIZED', 'No user token provided via cookies');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    let decoded: UserJwtPayload;
    try {
      decoded = jwt.verify(token, secret) as UserJwtPayload;
    } catch (err) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired user token');
    }

    if (!decoded.user_id) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid token payload');
    }

    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { id: decoded.user_id } });

    if (!user) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not found');
    }

    // Attach to request for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
