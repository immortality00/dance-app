'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/Loading';

export default function SignIn() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (provider: string) => {
    try {
      setLoading(provider);
      setError(null);

      const result = await signIn(provider, { 
        callbackUrl: '/',
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === 'OAuthSignin' 
          ? `Failed to sign in with ${provider}. Please try again.`
          : result.error);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 space-y-4">
          {[
            { id: 'google', name: 'Google' },
            { id: 'facebook', name: 'Facebook' },
            { id: 'apple', name: 'Apple' },
          ].map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleSignIn(provider.id)}
              disabled={loading !== null}
              className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                loading === provider.id
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              {loading === provider.id ? (
                <Loading size="sm" className="mr-2" />
              ) : (
                <Image
                  src={`/${provider.id}.svg`}
                  alt={provider.name}
                  width={20}
                  height={20}
                  className="mr-2"
                />
              )}
              {loading === provider.id ? 'Signing in...' : `Continue with ${provider.name}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 