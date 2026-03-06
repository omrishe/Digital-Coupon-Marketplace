import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_before_production';

/**
 * Express middleware that validates an admin JWT.
 * Expects: Authorization: Bearer <token>
 * Rejects with 401 if missing or invalid.
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
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
    const payload = jwt.verify(token, JWT_SECRET) as { admin_id: string; username: string };
    // Attach admin info to the request for downstream handlers
    (req as Request & { admin: typeof payload }).admin = payload;
    next();
  } catch {
    res.status(401).json({
      error_code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
  }
}
