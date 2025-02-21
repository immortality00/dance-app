import { FirestoreClassData } from '@/types/firebase';

interface PaymentResult {
  success: boolean;
  error?: string;
  transactionId?: string;
}

export function generateNomodDeepLink(classData: FirestoreClassData, userId: string) {
  const amount = classData.price.toFixed(2);
  const externalId = `class_${classData.id}_user_${userId}`;
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`;

  // Create Nomod deep link URL with all necessary parameters
  const deepLink = `nomod://charge/create?` + 
    `amount=${amount}` +
    `&currency=USD` +
    `&external_id=${externalId}` +
    `&callback=${encodeURIComponent(callbackUrl)}`;

  return deepLink;
}

export function handlePaymentCallback(params: URLSearchParams): PaymentResult {
  // Extract payment status and details from callback parameters
  const status = params.get('status');
  const transactionId = params.get('transaction_id');
  const errorCode = params.get('error_code');
  const errorMessage = params.get('error_message');

  if (status === 'success' && transactionId) {
    return {
      success: true,
      transactionId
    };
  }

  return {
    success: false,
    error: errorMessage || 'Payment failed. Please try again.'
  };
}

export function getPaymentStatusUrl(externalId: string): string {
  // URL to check payment status in Nomod app
  return `nomod://charge/view?external_id=${externalId}`;
} 