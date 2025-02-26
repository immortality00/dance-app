'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loading } from '@/components/Loading';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Welcome back, {user.name || 'User'}!
          </h1>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-indigo-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-indigo-900 mb-2">
                    My Classes
                  </h3>
                  <p className="text-indigo-600">
                    View your upcoming classes and schedule
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900 mb-2">
                    Book a Class
                  </h3>
                  <p className="text-purple-600">
                    Browse and book new dance classes
                  </p>
                </div>
                <div className="bg-pink-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-pink-900 mb-2">
                    My Progress
                  </h3>
                  <p className="text-pink-600">
                    Track your dance journey
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 