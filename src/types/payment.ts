import { FirestoreClassData } from './firebase';

export class PaymentError extends Error {
  code: PaymentErrorCode;
  details?: Record<string, any>;

  constructor(message: string, code: PaymentErrorCode, details?: Record<string, any>) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    this.details = details;
  }
}

export const PAYMENT_ERROR_CODES = {
  INVALID_EXTERNAL_ID: 'payment/invalid-external-id',
  CLASS_NOT_FOUND: 'payment/class-not-found',
  CLASS_FULL: 'payment/class-full',
  ALREADY_ENROLLED: 'payment/already-enrolled',
  TRANSACTION_FAILED: 'payment/transaction-failed',
  DATABASE_ERROR: 'payment/database-error',
  USER_NOT_FOUND: 'payment/user-not-found',
  INVALID_AMOUNT: 'payment/invalid-amount',
  INVALID_SIGNATURE: 'payment/invalid-signature',
  INVALID_TIMESTAMP: 'payment/invalid-timestamp',
  RATE_LIMIT_EXCEEDED: 'payment/rate-limit-exceeded',
} as const;

export type PaymentErrorCode = typeof PAYMENT_ERROR_CODES[keyof typeof PAYMENT_ERROR_CODES];

export interface PaymentResult {
  success: boolean;
  error?: PaymentError;
  transactionId?: string;
}

export interface PaymentCallbackResult {
  success: boolean;
  message?: string;
  data?: {
    transactionId: string;
    classDetails: any;
    amount: number;
  };
  error?: {
    code: PaymentErrorCode;
    message: string;
    details?: Record<string, any>;
  };
}

export type { FirestoreClassData }; 