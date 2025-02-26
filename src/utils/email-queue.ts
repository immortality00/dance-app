import { EmailOptions, sendEmail, EmailResult, EmailError, EMAIL_ERROR_CODES } from '@/lib/email';
import { logger } from '@/utils/logger';

interface QueuedEmail {
  id: string;
  options: EmailOptions;
  retries: number;
  lastAttempt?: Date;
}

interface QueueMetrics {
  totalSent: number;
  totalFailed: number;
  totalRetries: number;
  averageLatency: number;
  ratePerSecond: number;
}

class EmailQueue {
  private queue: QueuedEmail[] = [];
  private processing = false;
  private rateLimitPerSecond: number;
  private maxRetries: number;
  private retryDelayMs: number;
  private metrics: QueueMetrics = {
    totalSent: 0,
    totalFailed: 0,
    totalRetries: 0,
    averageLatency: 0,
    ratePerSecond: 0,
  };
  private lastProcessed: Date = new Date();

  constructor(options: {
    rateLimitPerSecond?: number;
    maxRetries?: number;
    retryDelayMs?: number;
  } = {}) {
    this.rateLimitPerSecond = options.rateLimitPerSecond || 10;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelayMs = options.retryDelayMs || 1000;
  }

  public async add(options: EmailOptions): Promise<void> {
    const emailId = Math.random().toString(36).substring(7);
    this.queue.push({
      id: emailId,
      options,
      retries: 0,
    });
    logger.info('Email added to queue', { id: emailId, recipient: options.to });
    
    if (!this.processing) {
      this.processQueue();
    }
  }

  public async addBulk(emails: EmailOptions[]): Promise<void> {
    const emailIds = emails.map(() => Math.random().toString(36).substring(7));
    
    this.queue.push(...emails.map((options, index) => ({
      id: emailIds[index],
      options,
      retries: 0,
    })));

    logger.info('Bulk emails added to queue', { count: emails.length });
    
    if (!this.processing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const startTime = Date.now();

    try {
      while (this.queue.length > 0) {
        const now = Date.now();
        const timeSinceLastProcessed = now - this.lastProcessed.getTime();
        const minTimeBetweenEmails = 1000 / this.rateLimitPerSecond;

        if (timeSinceLastProcessed < minTimeBetweenEmails) {
          await new Promise(resolve => setTimeout(resolve, minTimeBetweenEmails - timeSinceLastProcessed));
        }

        const email = this.queue[0];
        const result = await this.sendWithRetry(email);

        if (result.success) {
          this.queue.shift();
          this.metrics.totalSent++;
          this.metrics.ratePerSecond = this.metrics.totalSent / ((now - startTime) / 1000);
          this.lastProcessed = new Date();
        } else {
          if (email.retries >= this.maxRetries) {
            this.queue.shift();
            this.metrics.totalFailed++;
            logger.error('Email failed after max retries', {
              id: email.id,
              recipient: email.options.to,
              error: result.error,
            });
          } else {
            // Move to end of queue for retry
            this.queue.shift();
            email.retries++;
            email.lastAttempt = new Date();
            this.queue.push(email);
            this.metrics.totalRetries++;
            await new Promise(resolve => setTimeout(resolve, this.retryDelayMs));
          }
        }
      }
    } catch (error) {
      logger.error('Error processing email queue', { error });
    } finally {
      this.processing = false;
    }
  }

  private async sendWithRetry(email: QueuedEmail): Promise<EmailResult> {
    try {
      const startTime = Date.now();
      const result = await sendEmail(email.options);
      const latency = Date.now() - startTime;

      // Update average latency
      this.metrics.averageLatency = (
        (this.metrics.averageLatency * this.metrics.totalSent) + latency
      ) / (this.metrics.totalSent + 1);

      if (result.success) {
        logger.info('Email sent successfully', {
          id: email.id,
          recipient: email.options.to,
          latency,
        });
      }

      return result;
    } catch (error) {
      logger.error('Error sending email', {
        id: email.id,
        recipient: email.options.to,
        error,
        retryCount: email.retries,
      });

      if (error instanceof EmailError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          }
        };
      }

      return {
        success: false,
        error: {
          code: EMAIL_ERROR_CODES.SEND_FAILED,
          message: error instanceof Error ? error.message : 'Failed to send email',
          details: { error }
        }
      };
    }
  }

  public getMetrics(): QueueMetrics {
    return { ...this.metrics };
  }

  public clearMetrics(): void {
    this.metrics = {
      totalSent: 0,
      totalFailed: 0,
      totalRetries: 0,
      averageLatency: 0,
      ratePerSecond: 0,
    };
  }
}

// Export singleton instance
export const emailQueue = new EmailQueue();

// Export the class for testing or custom instances
export { EmailQueue }; 