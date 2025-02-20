import { config } from '@/config/env';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(config.sendgrid.apiKey);

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export type AttendanceStatus = 'present' | 'absent';

interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

interface EmailResult {
  success: boolean;
  error?: {
    message: string;
    code?: string;
    details?: string;
  };
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeHtml(html: string): string {
  // Basic HTML sanitization
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/gi, '');
}

export async function sendEmail({ to, subject, text, html }: EmailOptions): Promise<EmailResult> {
  try {
    // Validate email address
    if (!validateEmail(to)) {
      throw new Error('Invalid email address');
    }

    // Validate required fields
    if (!subject || !text) {
      throw new Error('Subject and text content are required');
    }

    // Sanitize HTML content if provided
    const sanitizedHtml = html ? sanitizeHtml(html) : text;

    // Send email with retry logic
    let retries = 3;
    let lastError: any;

    while (retries > 0) {
      try {
        await sgMail.send({
          to,
          from: config.sendgrid.fromEmail,
          subject,
          text,
          html: sanitizedHtml,
        });
        return { success: true };
      } catch (err) {
        lastError = err;
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        }
      }
    }

    // If all retries failed, throw the last error
    throw lastError;
  } catch (error: any) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: {
        message: 'Failed to send email',
        code: error.code,
        details: error.message,
      },
    };
  }
}

export const emailTemplates = {
  classEnrollment(className: string): EmailTemplate {
    const subject = `Welcome to ${className}!`;
    const text = `You have successfully enrolled in ${className}. We look forward to seeing you in class!`;
    const html = `
      <h1>Welcome to ${className}!</h1>
      <p>You have successfully enrolled in ${className}. We look forward to seeing you in class!</p>
      <p>Please make sure to arrive 10 minutes before the class starts.</p>
    `;

    return { subject, text, html };
  },

  classReminder(className: string, date: string, time: string): EmailTemplate {
    const subject = `Reminder: ${className} Tomorrow`;
    const text = `This is a reminder that your ${className} class is scheduled for tomorrow, ${date} at ${time}.`;
    const html = `
      <h1>Class Reminder</h1>
      <p>This is a reminder that your <strong>${className}</strong> class is scheduled for tomorrow.</p>
      <p>Date: ${date}</p>
      <p>Time: ${time}</p>
      <p>Please arrive 10 minutes before the class starts.</p>
    `;

    return { subject, text, html };
  },

  attendanceUpdate(className: string, date: string, status: AttendanceStatus): EmailTemplate {
    const subject = `Attendance Record: ${className}`;
    const text = `Your attendance for ${className} on ${date} has been marked as ${status}.`;
    const html = `
      <h1>Attendance Record</h1>
      <p>Your attendance for <strong>${className}</strong> on ${date} has been marked as <strong>${status}</strong>.</p>
      ${status === 'absent' ? '<p>If you believe this is incorrect, please contact your instructor.</p>' : ''}
    `;

    return { subject, text, html };
  },

  classUpdate(className: string, updateType: string, details: string): EmailTemplate {
    const subject = `Class Update: ${className}`;
    const text = `Important update regarding your ${className} class: ${updateType}. ${details}`;
    const html = `
      <h1>Class Update: ${className}</h1>
      <h2>${updateType}</h2>
      <p>${details}</p>
    `;

    return { subject, text, html };
  },
}; 