import { ApiErrorCode } from '@repo/shared';

export class AppError extends Error {
  public statusCode: number;
  public error_code: ApiErrorCode;

  constructor(statusCode: number, error_code: ApiErrorCode, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.error_code = error_code;
    //fixes cases of AppError not being recognized as an instance of AppError by making it
    Object.setPrototypeOf(this, AppError.prototype);

    // Capture the stack trace (eg: AppError: User not found at getUser (/services/user.ts:20) at controller (/controllers/user.ts:5))
    Error.captureStackTrace(this, this.constructor);
  }
}
