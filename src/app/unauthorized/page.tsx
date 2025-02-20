'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function Unauthorized() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <div className="mt-4 text-center text-red-600">
            You don't have permission to access this page.
          </div>
          {user && (
            <div className="mt-2 text-center text-gray-600">
              Current role: {user.role}
            </div>
          )}
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 