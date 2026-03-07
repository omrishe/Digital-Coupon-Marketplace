import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { AppError } from '../utils/AppError';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface UserJwtPayload {
  user_id: string; // The primary key
}

export type UserAuthError = 'USER_ALREADY_EXISTS' | 'VALIDATION_ERROR' | 'UNAUTHORIZED';

export interface UserAuthResult {
  success: boolean;
  token?: string;
  error?: UserAuthError;
}

// ─── Helper Functions ────────────────────────────────────────────────────────

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  const payload: UserJwtPayload = { user_id: userId };
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

// ─── Services ────────────────────────────────────────────────────────────────

export const registerUser = async (
  dataSource: DataSource,
  username: string,
  passwordRaw: string,
): Promise<UserAuthResult> => {
  const repo = dataSource.getRepository(User);

  // Check if username already exists
  const existingUser = await repo.findOne({ where: { username } });
  if (existingUser) {
    return { success: false, error: 'USER_ALREADY_EXISTS' };
  }

  try {
    const password_hash = await bcrypt.hash(passwordRaw, 10);
    const user = repo.create({ username, password_hash });
    const saved = await repo.save(user);

    return { success: true, token: generateToken(saved.id) };
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: 'VALIDATION_ERROR' };
  }
};

export const loginUser = async (
  dataSource: DataSource,
  username: string,
  passwordRaw: string,
): Promise<UserAuthResult> => {
  const repo = dataSource.getRepository(User);

  const user = await repo.findOne({ where: { username } });
  if (!user) {
    return { success: false, error: 'UNAUTHORIZED' };
  }

  const isValid = await bcrypt.compare(passwordRaw, user.password_hash);
  if (!isValid) {
    return { success: false, error: 'UNAUTHORIZED' };
  }

  return { success: true, token: generateToken(user.id) };
};
