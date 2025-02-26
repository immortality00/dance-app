import type { Profile } from 'next-auth';
import type { LoggerInstance } from 'next-auth';

export class AuthError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export const AUTH_ERROR_CODES = {
  MISSING_EMAIL: 'auth/missing-email',
  USER_NOT_FOUND: 'auth/user-not-found',
  EMAIL_EXISTS: 'auth/email-already-exists',
  INVALID_CREDENTIALS: 'auth/invalid-credentials',
  ACCOUNT_EXISTS: 'auth/account-exists-with-different-credential',
  PROVIDER_ERROR: 'auth/provider-error',
  DATABASE_ERROR: 'auth/database-error',
  RATE_LIMIT_EXCEEDED: 'auth/rate-limit-exceeded',
} as const;

export type AuthErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES];

export interface AuthProfile extends Profile {
  locale?: string;
}

export type LoggerMetadata = {
  [key: string]: unknown;
  error?: Error;
};

export type AuthLogger = Required<LoggerInstance>; 