import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { ResellerJwtPayload } from '@repo/shared';

const JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET is not defined in environment variables');
}

/**
 * Express middleware that validates a reseller JWT.
 * Expects: Authorization: Bearer <token>
 * The JWT payload must contain reseller_id.
 * Rejects with 401 if missing or invalid.
 */
export function requireResellerAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error_code: 'UNAUTHORIZED',
      message: 'Missing or malformed Authorization header',
    });
    return;
  }

  const token = authHeader.slice(7);
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    const payload = jwt.verify(token, JWT_SECRET) as ResellerJwtPayload;

    if (!payload.reseller_id) {
      res.status(401).json({
        error_code: 'UNAUTHORIZED',
        message: 'Invalid token: missing reseller_id',
      });
      return;
    }

    // Attach reseller info to the request for downstream handlers
    req.reseller = payload;
    next();
  } catch {
    res.status(401).json({
      error_code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
  }
}
