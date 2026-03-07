import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DataSource } from 'typeorm';
import { Admin } from '../entities/Admin';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  console.error('CRITICAL ERROR: JWT_SECRET is not defined in environment variables');
}
const JWT_EXPIRY = '8h';

export type AuthResult =
  | { success: true; token: string }
  | { success: false; error: 'USER_NOT_FOUND' | 'INVALID_PASSWORD' | 'USER_ALREADY_EXISTS' };

/** Register a new admin — password is hashed with bcrypt before saving */
export async function registerAdmin(
  dataSource: DataSource,
  username: string,
  password: string,
): Promise<AuthResult> {
  const repo = dataSource.getRepository(Admin);

  const existing = await repo.findOneBy({ username });
  if (existing) {
    return { success: false, error: 'USER_ALREADY_EXISTS' };
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const admin = repo.create({ username, password_hash });
  await repo.save(admin);

  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
  return { success: true, token };
}

/** Login an existing admin verifies the bcrypt hash */
export async function loginAdmin(
  dataSource: DataSource,
  username: string,
  password: string,
): Promise<AuthResult> {
  const repo = dataSource.getRepository(Admin);

  const admin = await repo.findOneBy({ username });
  if (!admin) {
    return { success: false, error: 'USER_NOT_FOUND' };
  }

  const isValid = await bcrypt.compare(password, admin.password_hash);
  if (!isValid) {
    return { success: false, error: 'INVALID_PASSWORD' };
  }

  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
  return { success: true, token };
}
