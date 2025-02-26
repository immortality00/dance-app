import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/config/firebase';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { logger } from '@/utils/logger';
import { PaymentError, PAYMENT_ERROR_CODES, PaymentCallbackResult } from '@/types/payment';
import { validateFirestoreData, classSchema, FirestoreClass } from '@/utils/firestore-validation';
import { sendEmail, emailTemplates } from '@/lib/email';
import { getPrivateConfig, maskSensitiveData } from '@/utils/secure-config';
import { z } from 'zod';
import { createHash, timingSafeEqual } from 'crypto';
import { emailQueue } from '@/utils/email-queue';

// Get private configuration
const config = getPrivateConfig();

// Validate incoming payment callback data
const paymentCallbackSchema = z.object({
  externalId: z.string(),
  userId: z.string(),
  paymentId: z.string(),
  amount: z.number().positive(),
  paymentMethod: z.string(),
  transactionDetails: z.record(z.unknown()).optional(),
  timestamp: z.number(),
  signature: z.string(),
});

type PaymentCallbackData = z.infer<typeof paymentCallbackSchema>;

// Verify webhook signature
function verifySignature(payload: any, signature: string): boolean {
  const expectedSignature = createHash('sha256')
    .update(`${payload.timestamp}.${JSON.stringify(payload)}.${config.STRIPE_WEBHOOK_SECRET}`)
    .digest('hex');

  try {
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<PaymentCallbackResult>> {
  try {
    // Rate limiting check
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    
    // TODO: Implement rate limiting based on clientIp
    // For now, just log the attempt
    logger.info('Payment callback attempt', maskSensitiveData({
      ip: clientIp,
      timestamp: new Date().toISOString()
    }));

    const rawData = await request.json();
    logger.info('Payment callback received', maskSensitiveData({ data: rawData }));

    // Validate incoming data
    let data: PaymentCallbackData;
    try {
      data = paymentCallbackSchema.parse(rawData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new PaymentError(
          'Invalid payment callback data',
          PAYMENT_ERROR_CODES.INVALID_EXTERNAL_ID,
          maskSensitiveData({ 
            errors: error.errors,
            receivedData: rawData 
          })
        );
      }
      throw error;
    }

    // Verify webhook signature
    if (!verifySignature(rawData, data.signature)) {
      throw new PaymentError(
        'Invalid webhook signature',
        PAYMENT_ERROR_CODES.INVALID_SIGNATURE
      );
    }

    // Check timestamp to prevent replay attacks (5 minute window)
    const now = Date.now();
    if (Math.abs(now - data.timestamp) > 5 * 60 * 1000) {
      throw new PaymentError(
        'Invalid timestamp',
        PAYMENT_ERROR_CODES.INVALID_TIMESTAMP,
        { timestamp: data.timestamp, serverTime: now }
      );
    }

    // Process the payment in a transaction to ensure data consistency
    const result = await runTransaction(db, async (transaction) => {
      // Get class reference
      const classRef = doc(db, 'classes', data.externalId);
      const classDoc = await transaction.get(classRef);

      if (!classDoc.exists()) {
        throw new PaymentError(
          'Class not found',
          PAYMENT_ERROR_CODES.CLASS_NOT_FOUND,
          { classId: data.externalId }
        );
      }

      // Validate class data
      const classData = validateFirestoreData(
        classSchema,
        { ...classDoc.data(), id: classDoc.id },
        'class'
      );

      // Get user data for email notification
      const userRef = doc(db, 'users', data.userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        throw new PaymentError(
          'User not found',
          PAYMENT_ERROR_CODES.USER_NOT_FOUND,
          { userId: data.userId }
        );
      }

      const userData = userDoc.data();

      // Validate class capacity
      if (classData.enrolled >= classData.capacity) {
        throw new PaymentError(
          'Class is already full',
          PAYMENT_ERROR_CODES.CLASS_FULL,
          {
            classId: data.externalId,
            enrolled: classData.enrolled,
            capacity: classData.capacity
          }
        );
      }

      // Check if user is already enrolled
      const enrollmentRef = doc(db, 'enrollments', `${data.userId}_${data.externalId}`);
      const enrollmentDoc = await transaction.get(enrollmentRef);

      if (enrollmentDoc.exists()) {
        throw new PaymentError(
          'User is already enrolled in this class',
          PAYMENT_ERROR_CODES.ALREADY_ENROLLED,
          {
            userId: data.userId,
            classId: data.externalId
          }
        );
      }

      // Validate payment amount
      if (data.amount !== classData.price) {
        throw new PaymentError(
          'Invalid payment amount',
          PAYMENT_ERROR_CODES.INVALID_AMOUNT,
          {
            expected: classData.price,
            received: data.amount
          }
        );
      }

      // Update class enrollment count
      transaction.update(classRef, {
        enrolled: classData.enrolled + 1,
        enrolledStudents: [...classData.enrolledStudents, data.userId],
        lastUpdated: new Date()
      });

      // Create enrollment record with idempotency key
      const idempotencyKey = createHash('sha256')
        .update(`${data.userId}_${data.externalId}_${data.paymentId}`)
        .digest('hex');

      transaction.set(enrollmentRef, {
        userId: data.userId,
        classId: data.externalId,
        enrolledAt: new Date(),
        paymentId: data.paymentId,
        amount: data.amount,
        status: 'active',
        idempotencyKey,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create payment record
      const paymentRef = doc(db, 'payments', data.paymentId);
      transaction.set(paymentRef, {
        userId: data.userId,
        classId: data.externalId,
        amount: data.amount,
        status: 'completed',
        processedAt: new Date(),
        paymentMethod: data.paymentMethod,
        transactionDetails: maskSensitiveData(data.transactionDetails || {}),
        idempotencyKey,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Send confirmation emails asynchronously after transaction
      if (userData.email) {
        // Add both emails to the queue
        emailQueue.addBulk([
          {
            to: userData.email,
            ...emailTemplates.paymentConfirmation(classData.name, data.amount)
          },
          {
            to: userData.email,
            ...emailTemplates.classEnrollment(classData.name)
          }
        ]).catch((error: unknown) => {
          logger.error('Failed to queue confirmation emails', maskSensitiveData({
            error,
            userId: data.userId,
            classId: data.externalId
          }));
        });
      }

      return {
        transactionId: data.paymentId,
        classDetails: classData,
        amount: data.amount
      };
    });

    logger.info('Payment processed successfully', maskSensitiveData({
      paymentId: data.paymentId,
      classId: data.externalId,
      userId: data.userId
    }));

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      data: result
    } as PaymentCallbackResult);

  } catch (error) {
    // Handle known payment errors
    if (error instanceof PaymentError) {
      logger.error('Payment processing error', maskSensitiveData({
        code: error.code,
        message: error.message,
        details: error.details
      }));

      return NextResponse.json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      } as PaymentCallbackResult, { status: 400 });
    }

    // Handle validation errors
    if (error instanceof z.ZodError) {
      logger.error('Payment data validation error', {
        errors: error.errors
      });

      return NextResponse.json({
        success: false,
        error: {
          code: PAYMENT_ERROR_CODES.INVALID_EXTERNAL_ID,
          message: 'Invalid payment data format',
          details: {
            errors: error.errors
          }
        }
      } as PaymentCallbackResult, { status: 400 });
    }

    // Handle unexpected errors
    logger.error('Unexpected error during payment processing', maskSensitiveData({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }));

    return NextResponse.json({
      success: false,
      error: {
        code: PAYMENT_ERROR_CODES.TRANSACTION_FAILED,
        message: 'An unexpected error occurred while processing the payment',
        details: {
          errorId: Date.now().toString()
        }
      }
    } as PaymentCallbackResult, { status: 500 });
  }
} 