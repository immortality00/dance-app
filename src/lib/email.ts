import { z } from 'zod';
import sgMail from '@sendgrid/mail';
import { logger } from '@/utils/logger';
import { getPrivateConfig, maskSensitiveData } from '@/utils/secure-config';
import { AttendanceStatus } from '@/types/firebase';

// Get private configuration
const config = getPrivateConfig();

// Initialize SendGrid with API key
sgMail.setApiKey(config.SENDGRID_API_KEY);

// Email validation schema
const emailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  text: z.string().min(1, 'Text content is required'),
  html: z.string().optional(),
});

export type EmailOptions = z.infer<typeof emailSchema>;

// Email error types
export class EmailError extends Error {
  code: string;
  details?: Record<string, any>;

  constructor(message: string, code: string, details?: Record<string, any>) {
    super(message);
    this.name = 'EmailError';
    this.code = code;
    this.details = maskSensitiveData(details || {});
  }
}

export const EMAIL_ERROR_CODES = {
  INVALID_OPTIONS: 'email/invalid-options',
  MISSING_RECIPIENT: 'email/missing-recipient',
  MISSING_SUBJECT: 'email/missing-subject',
  MISSING_CONTENT: 'email/missing-content',
  INVALID_EMAIL: 'email/invalid-email',
  SEND_FAILED: 'email/send-failed',
  RATE_LIMIT_EXCEEDED: 'email/rate-limit-exceeded',
  INVALID_TEMPLATE: 'email/invalid-template',
  TEMPLATE_RENDER_ERROR: 'email/template-render-error',
  CONFIG_ERROR: 'email/config-error',
} as const;

export type EmailErrorCode = typeof EMAIL_ERROR_CODES[keyof typeof EMAIL_ERROR_CODES];

// Email result type
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: {
    code: EmailErrorCode;
    message: string;
    details?: Record<string, any>;
  };
}

// Email template interface
export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

// Maximum retry attempts for sending emails
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000; // 1 second

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Validate email configuration
function validateEmailConfig() {
  if (!config.SENDGRID_API_KEY) {
    throw new EmailError(
      'SendGrid API key is not configured',
      EMAIL_ERROR_CODES.CONFIG_ERROR
    );
  }
  if (!config.SENDGRID_FROM_EMAIL) {
    throw new EmailError(
      'Sender email is not configured',
      EMAIL_ERROR_CODES.CONFIG_ERROR
    );
  }
}

// Send email with retry logic
async function sendEmailWithRetry(
  options: EmailOptions,
  attempt: number = 1
): Promise<EmailResult> {
  try {
    // Validate email options
    const validatedOptions = emailSchema.parse(options);

    const msg = {
      to: validatedOptions.to,
      from: config.SENDGRID_FROM_EMAIL,
      subject: validatedOptions.subject,
      text: validatedOptions.text,
      html: validatedOptions.html || validatedOptions.text,
    };

    const response = await sgMail.send(msg);
    const messageId = response[0]?.headers['x-message-id'];

    logger.info('Email sent successfully', {
      to: validatedOptions.to,
      subject: validatedOptions.subject,
      messageId,
    });

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      logger.error('Email validation error', {
        errors: error.errors,
      });
      return {
        success: false,
        error: {
          code: EMAIL_ERROR_CODES.INVALID_OPTIONS,
          message: 'Invalid email options',
          details: { errors: error.errors },
        },
      };
    }

    // Handle SendGrid errors
    if (error instanceof Error) {
      const sgError = error as any;
      logger.error('SendGrid error', maskSensitiveData({
        code: sgError.code,
        message: sgError.message,
        response: sgError.response?.body,
      }));

      // Check if we should retry
      if (attempt < MAX_RETRY_ATTEMPTS && isRetryableError(sgError)) {
        logger.warn(`Retrying email send (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS})`);
        await delay(RETRY_DELAY_MS * attempt);
        return sendEmailWithRetry(options, attempt + 1);
      }

      return {
        success: false,
        error: {
          code: getErrorCode(sgError),
          message: sgError.message,
          details: maskSensitiveData({
            response: sgError.response?.body,
            attempt,
          }),
        },
      };
    }

    // Handle unknown errors
    logger.error('Unknown email error', maskSensitiveData({ error }));
    return {
      success: false,
      error: {
        code: EMAIL_ERROR_CODES.SEND_FAILED,
        message: 'Failed to send email',
        details: maskSensitiveData({ error }),
      },
    };
  }
}

// Helper function to determine if an error is retryable
function isRetryableError(error: any): boolean {
  // Rate limit errors
  if (error.code === 429) return true;
  
  // Server errors
  if (error.code >= 500) return true;
  
  // Network errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') return true;
  
  return false;
}

// Helper function to map SendGrid errors to our error codes
function getErrorCode(error: any): EmailErrorCode {
  if (error.code === 429) return EMAIL_ERROR_CODES.RATE_LIMIT_EXCEEDED;
  if (error.code === 'INVALID_TEMPLATE') return EMAIL_ERROR_CODES.INVALID_TEMPLATE;
  return EMAIL_ERROR_CODES.SEND_FAILED;
}

// Email templates
export const emailTemplates = {
  classEnrollment(className: string): EmailTemplate {
    return {
      subject: `Enrolled in ${className}`,
      text: `You have successfully enrolled in ${className}. We look forward to seeing you in class!`,
      html: `
        <h2>Class Enrollment Confirmation</h2>
        <p>You have successfully enrolled in <strong>${className}</strong>.</p>
        <p>We look forward to seeing you in class!</p>
      `,
    };
  },

  classReminder(className: string, date: string, time: string): EmailTemplate {
    return {
      subject: `Reminder: ${className} class tomorrow`,
      text: `This is a reminder that your ${className} class is scheduled for ${date} at ${time}.`,
      html: `
        <h2>Class Reminder</h2>
        <p>This is a reminder that your <strong>${className}</strong> class is scheduled for:</p>
        <p>Date: ${date}<br>Time: ${time}</p>
      `,
    };
  },

  paymentConfirmation(className: string, amount: number): EmailTemplate {
    return {
      subject: `Payment Confirmation - ${className}`,
      text: `Your payment of $${amount} for ${className} has been processed successfully.`,
      html: `
        <h2>Payment Confirmation</h2>
        <p>Your payment has been processed successfully:</p>
        <p>Class: ${className}<br>Amount: $${amount}</p>
      `,
    };
  },

  attendanceUpdate(className: string, date: string, status: AttendanceStatus): EmailTemplate {
    const statusText = status === 'present' ? 'present at' : 'absent from';
    return {
      subject: `Attendance Update - ${className}`,
      text: `This is to confirm that you were marked as ${statusText} ${className} on ${date}.`,
      html: `
        <h2>Attendance Update</h2>
        <p>This is to confirm that you were marked as <strong>${statusText}</strong>:</p>
        <p>Class: ${className}<br>Date: ${date}</p>
      `,
    };
  },
};

// Main email sending function
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    validateEmailConfig();
    return await sendEmailWithRetry(options);
  } catch (error) {
    if (error instanceof EmailError) {
      logger.error('Email configuration error', {
        code: error.code,
        message: error.message,
      });
      return {
        success: false,
        error: {
          code: error.code as EmailErrorCode,
          message: error.message,
          details: error.details,
        },
      };
    }
    throw error;
  }
} 