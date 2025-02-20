'use client';

import { useAuth } from '@/hooks/useAuth';
import { withAuth } from '@/components/auth/withAuth';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import type { FirestoreClassData } from '@/types/firebase';

interface DashboardError {
  message: string;
  code?: string;
  details?: string;
}

function Dashboard() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DashboardError | null>(null);
  const [recentClasses, setRecentClasses] = useState<FirestoreClassData[]>([]);

  useEffect(() => {
    fetchRecentClasses();
  }, []);

  const fetchRecentClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      const classesQuery = query(
        collection(db, 'classes'),
        where('enrolledStudents', 'array-contains', user?.id),
        orderBy('lastUpdated', 'desc'),
        limit(5)
      );

      const classesSnapshot = await getDocs(classesQuery);
      const classesData = classesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreClassData[];

      setRecentClasses(classesData);
    } catch (err: any) {
      console.error('Error fetching recent classes:', err);
      setError({
        message: 'Failed to fetch recent classes',
        code: err.code,
        details: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                {user?.image && (
                  <Image
                    src={user.image}
                    alt={user.name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="text-gray-700">{user?.name}</span>
                <button
                  onClick={() => signOut()}
                  className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error.message}</h3>
                {error.details && (
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error.details}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
              <h2 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h2>
              
              {recentClasses.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Your Recent Classes</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {recentClasses.map(classData => (
                      <div key={classData.id} className="bg-white shadow rounded-lg p-4">
                        <h4 className="text-lg font-medium">{classData.name}</h4>
                        <p className="text-sm text-gray-500">{classData.description}</p>
                        <p className="mt-2 text-sm text-gray-600">Schedule: {classData.schedule}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">
                  You are not enrolled in any classes yet. Visit the Classes page to browse available classes.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default withAuth(Dashboard); 