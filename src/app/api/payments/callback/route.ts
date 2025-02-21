import { NextResponse } from 'next/server';
import { handlePaymentCallback } from '@/lib/payment';
import { db } from '@/config/firebase';
import { doc, runTransaction, getDoc } from 'firebase/firestore';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentResult = handlePaymentCallback(searchParams);
    const externalId = searchParams.get('external_id');

    if (!externalId) {
      return NextResponse.json(
        { error: 'Missing external ID' },
        { status: 400 }
      );
    }

    // Extract class and user IDs from external_id
    const [, classId, , userId] = externalId.split('_');

    if (paymentResult.success) {
      // Process successful payment and confirm booking
      await runTransaction(db, async (transaction) => {
        const classRef = doc(db, 'classes', classId);
        const classDoc = await transaction.get(classRef);

        if (!classDoc.exists()) {
          throw new Error('Class not found');
        }

        const classData = classDoc.data();
        
        // Check if class is full
        if (classData.enrolled >= classData.capacity) {
          throw new Error('Class is full');
        }

        // Update class enrollment
        transaction.update(classRef, {
          enrolled: classData.enrolled + 1,
          enrolledStudents: [...(classData.enrolledStudents || []), userId],
        });

        // Record payment
        const paymentRef = doc(db, 'payments', paymentResult.transactionId!);
        transaction.set(paymentRef, {
          userId,
          classId,
          amount: classData.price,
          status: 'completed',
          timestamp: new Date(),
          transactionId: paymentResult.transactionId,
        });
      });

      // Send confirmation email
      const userDoc = await getDoc(doc(db, 'users', userId));
      const classDoc = await getDoc(doc(db, 'classes', classId));
      
      if (userDoc.exists() && classDoc.exists()) {
        const userData = userDoc.data();
        const classData = classDoc.data();
        
        await sendEmail({
          to: userData.email,
          ...emailTemplates.classEnrollment(classData.name)
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Payment processed and booking confirmed'
      });
    } else {
      // Handle failed payment
      await runTransaction(db, async (transaction) => {
        // Record failed payment attempt
        const paymentRef = doc(db, 'payments', `failed_${Date.now()}`);
        transaction.set(paymentRef, {
          userId,
          classId,
          status: 'failed',
          error: paymentResult.error,
          timestamp: new Date(),
        });
      });

      return NextResponse.json({
        success: false,
        error: paymentResult.error
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Payment callback error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    }, { status: 500 });
  }
} 