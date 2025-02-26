'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AUTH_ERROR_CODES } from '@/types/auth';

export default function AuthError() {
  const searchParams = useSearchParams();
  const t = useTranslations('Auth.errors');
  const error = searchParams.get('error');
  const errorCode = searchParams.get('code');

  const getErrorMessage = (error: string | null, code: string | null): string => {
    // First check for our custom error codes
    if (code) {
      switch (code) {
        case AUTH_ERROR_CODES.MISSING_EMAIL:
          return t('missingEmail');
        case AUTH_ERROR_CODES.USER_NOT_FOUND:
          return t('userNotFound');
        case AUTH_ERROR_CODES.EMAIL_EXISTS:
          return t('emailExists');
        case AUTH_ERROR_CODES.INVALID_CREDENTIALS:
          return t('invalidCredentials');
        case AUTH_ERROR_CODES.ACCOUNT_EXISTS:
          return t('accountExists');
        case AUTH_ERROR_CODES.DATABASE_ERROR:
          return t('databaseError');
        case AUTH_ERROR_CODES.PROVIDER_ERROR:
          return t('providerError');
      }
    }

    // Then check for NextAuth default error types
    switch (error) {
      case 'Configuration':
        return t('configuration');
      case 'AccessDenied':
        return t('accessDenied');
      case 'Verification':
        return t('verification');
      case 'OAuthSignin':
        return t('oAuthSignin');
      case 'OAuthCallback':
        return t('oAuthCallback');
      case 'OAuthCreateAccount':
        return t('oAuthCreateAccount');
      case 'EmailCreateAccount':
        return t('emailCreateAccount');
      case 'Callback':
        return t('callback');
      case 'OAuthAccountNotLinked':
        return t('oAuthAccountNotLinked');
      case 'EmailSignin':
        return t('emailSignin');
      case 'CredentialsSignin':
        return t('credentialsSignin');
      case 'SessionRequired':
        return t('sessionRequired');
      default:
        return t('default');
    }
  };

  const errorMessage = getErrorMessage(error, errorCode);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('title')}
          </h2>
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center space-y-4">
          <Link
            href="/auth/signin"
            className="text-indigo-600 hover:text-indigo-500 block"
          >
            {t('tryAgain')}
          </Link>
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-400 block"
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
} 