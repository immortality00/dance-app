'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { collection, query, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/Loading';
import { useToast } from '@/components/Toast';
import type { FirestoreClassData } from '@/types/firebase';

export default function ClassesPage() {
  const [classes, setClasses] = useState<FirestoreClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();
  const t = useTranslations('Classes');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      console.log('Starting to fetch classes...');
      setLoading(true);
      const classesRef = collection(db, 'classes');
      console.log('Created classes collection reference');
      
      // Fetch all classes without date filter initially
      const snapshot = await getDocs(classesRef);
      console.log('Got snapshot, number of docs:', snapshot.size);
      
      const classesData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Processing doc:', doc.id, data);
        return {
          id: doc.id,
          ...data
        };
      }) as FirestoreClassData[];

      console.log('Processed classes data:', classesData);
      
      // Sort by date if available
      const sortedClasses = classesData.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return a.date.seconds - b.date.seconds;
      });
      
      setClasses(sortedClasses);
      setError(null);
    } catch (err) {
      console.error('Detailed error fetching classes:', err);
      setError(t('errors.fetchClasses'));
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (classData: FirestoreClassData) => {
    if (!user) {
      showToast(t('errors.notLoggedIn'), 'error');
      return;
    }

    try {
      if (classData.enrolled >= classData.capacity) {
        showToast(t('errors.classFull'), 'error');
        return;
      }

      if (classData.enrolledStudents.includes(user.id)) {
        showToast(t('errors.alreadyEnrolled'), 'error');
        return;
      }

      // TODO: Implement booking logic with payment integration
      showToast(t('messages.bookingInProgress'), 'info');
    } catch (err) {
      console.error('Error booking class:', err);
      showToast(t('errors.bookingFailed'), 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchClasses}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {t('buttons.tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t('title')}
      </h1>

      {classes.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          {t('messages.noClasses')}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classData) => (
            <div
              key={classData.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {classData.name}
                </h3>
                <p className="text-gray-600 mb-4">{classData.description}</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>
                    {t('fields.instructor')}: {classData.teacherId}
                  </p>
                  <p>
                    {t('fields.date')}: {classData.date?.toDate().toLocaleDateString() || 'N/A'}
                  </p>
                  <p>
                    {t('fields.time')}: {classData.schedule || 'N/A'}
                  </p>
                  <p>
                    {t('fields.duration')}: {classData.duration || 'N/A'} {t('fields.minutes')}
                  </p>
                  <p>
                    {t('fields.level')}: {classData.level || 'N/A'}
                  </p>
                  <p>
                    {t('fields.style')}: {classData.style || 'N/A'}
                  </p>
                  <p>
                    {t('fields.availability')}: {classData.enrolled}/{classData.capacity}
                  </p>
                  <p>
                    {t('fields.price')}: ${classData.price || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => handleBooking(classData)}
                  disabled={classData.enrolled >= classData.capacity}
                  className={`mt-4 w-full px-4 py-2 rounded text-white ${
                    classData.enrolled >= classData.capacity
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {classData.enrolled >= classData.capacity
                    ? t('buttons.classFull')
                    : t('buttons.book')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 