'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import { Loading } from '@/components/Loading';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Auth');
  const { signIn } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
      router.push(callbackUrl);
    } catch (error) {
      console.error('Sign in error:', error);
      showToast(t('errors.signIn'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('signIn.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('signIn.subtitle')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                {t('fields.email')}
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('fields.email')}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('fields.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('fields.password')}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? (
                <Loading size="sm" className="text-white" />
              ) : (
                t('buttons.signIn')
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a
                href="/auth/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {t('links.signUp')}
              </a>
            </div>
            <div className="text-sm">
              <a
                href="/auth/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {t('links.forgotPassword')}
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 