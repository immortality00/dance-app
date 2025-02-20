'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const getErrorMessage = (error: string | null) => {
  switch (error) {
    case 'Configuration':
      return 'There is a problem with the server configuration.';
    case 'AccessDenied':
      return 'You do not have permission to sign in.';
    case 'Verification':
      return 'The verification link was invalid or has expired.';
    case 'OAuthSignin':
      return 'Error occurred while signing in with the provider.';
    case 'OAuthCallback':
      return 'Error occurred while processing the sign in callback.';
    case 'OAuthCreateAccount':
      return 'Error occurred while creating your account.';
    case 'EmailCreateAccount':
      return 'Error occurred while creating your account.';
    case 'Callback':
      return 'Error occurred during the authentication callback.';
    case 'OAuthAccountNotLinked':
      return 'This email is already associated with another account.';
    case 'EmailSignin':
      return 'Error sending the verification email.';
    case 'CredentialsSignin':
      return 'Invalid credentials provided.';
    case 'SessionRequired':
      return 'Please sign in to access this page.';
    default:
      return 'An unexpected error occurred.';
  }
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorMessage = getErrorMessage(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4 text-center text-red-600">
            {errorMessage}
          </div>
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/auth/signin"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Try signing in again
          </Link>
        </div>
      </div>
    </div>
  );
} 