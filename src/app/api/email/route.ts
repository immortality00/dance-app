import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { logger } from '@/utils/logger';
import { maskSensitiveData } from '@/utils/secure-config';
import { z } from 'zod';

// Define validation schema for email requests
const emailRequestSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(100, 'Subject is too long'),
  text: z.string().min(1, 'Email body is required').max(10000, 'Email body is too long'),
  html: z.string().optional(),
  replyTo: z.string().email('Invalid reply-to email address').optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    contentType: z.string()
  })).optional()
});

type EmailRequest = z.infer<typeof emailRequestSchema>;

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_MAX = 5; // Maximum requests per minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Check rate limit
function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const userData = rateLimitMap.get(email);
  
  // Clear old entries
  if (userData && now - userData.timestamp > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.delete(email);
    return true;
  }
  
  if (userData && userData.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  // Update rate limit counter
  rateLimitMap.set(email, {
    count: (userData?.count || 0) + 1,
    timestamp: userData?.timestamp || now
  });
  
  return true;
}

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    
    try {
      const validatedData = emailRequestSchema.parse(body);
      
      // Check rate limit
      if (!checkRateLimit(validatedData.to)) {
        logger.warn('Rate limit exceeded for email sending', { 
          recipient: maskSensitiveData({ email: validatedData.to })
        });
        
        return NextResponse.json({
          success: false,
          message: 'Too many requests. Please try again later.'
        }, { status: 429 });
      }
      
      // Send email
      const result = await sendEmail(validatedData);
      
      if (result.success) {
        logger.info('Email sent successfully', { 
          recipient: maskSensitiveData({ email: validatedData.to })
        });
        
        return NextResponse.json({
          success: true,
          message: 'Email sent successfully'
        });
      } else {
        logger.error('Failed to send email', { 
          recipient: maskSensitiveData({ email: validatedData.to }),
          error: result.error
        });
        
        return NextResponse.json({
          success: false,
          message: 'Failed to send email',
          error: result.error
        }, { status: 500 });
      }
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        logger.warn('Invalid email request', { 
          errors: validationError.errors,
          data: maskSensitiveData(body)
        });
        
        return NextResponse.json({
          success: false,
          message: 'Invalid request data',
          errors: validationError.errors
        }, { status: 400 });
      }
      throw validationError;
    }
  } catch (error) {
    logger.error('Error processing email request', { error });
    
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred'
    }, { status: 500 });
  }
} 