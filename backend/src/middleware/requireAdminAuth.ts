import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET is not defined in environment variables');
}

/**
 * Express middleware that validates an admin JWT.
 * Expects token in HttpOnly cookie: adminToken
 * Rejects with 401 if missing or invalid.
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.adminToken;

  if (!token) {
    res.status(401).json({
      error_code: 'UNAUTHORIZED',
      message: 'Missing or malformed admin cookie token',
    });
    return;
  }

  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; username: string };
    // Attach admin info to the request for downstream handlers
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({
      error_code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
  }
}
