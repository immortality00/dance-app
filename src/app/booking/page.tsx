'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  runTransaction,
  doc,
  orderBy,
  Timestamp,
  limit,
  startAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import { Loading } from '@/components/Loading';
import { DanceStyle, type FirestoreClassData } from '@/types/firebase';

const CLASSES_PER_PAGE = 9;

export default function BookingPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [classes, setClasses] = useState<FirestoreClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState<DanceStyle | 'ALL'>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<FirestoreClassData['level'] | 'ALL'>('ALL');
  const [processing, setProcessing] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);

  const fetchClasses = useCallback(async (isLoadingMore = false) => {
    try {
      let baseQuery = query(
        collection(db, 'classes'),
        orderBy('lastUpdated', 'desc')
      );

      // Apply filters if selected
      if (selectedStyle !== 'ALL') {
        baseQuery = query(baseQuery, where('style', '==', selectedStyle));
      }
      if (selectedLevel !== 'ALL') {
        baseQuery = query(baseQuery, where('level', '==', selectedLevel));
      }

      // Apply pagination
      let paginatedQuery = query(baseQuery, limit(CLASSES_PER_PAGE));
      if (isLoadingMore && lastVisible) {
        paginatedQuery = query(baseQuery, startAfter(lastVisible), limit(CLASSES_PER_PAGE));
      }

      const snapshot = await getDocs(paginatedQuery);
      const newClasses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreClassData[];

      // Update last visible document for pagination
      setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === CLASSES_PER_PAGE);

      if (isLoadingMore) {
        setClasses(prev => [...prev, ...newClasses]);
      } else {
        setClasses(newClasses);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      showToast('Failed to fetch classes', 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedStyle, selectedLevel, lastVisible, showToast]);

  useEffect(() => {
    setLoading(true);
    setLastVisible(null);
    fetchClasses();
  }, [fetchClasses, selectedStyle, selectedLevel]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchClasses(true);
  };

  const handleBooking = async (classId: string) => {
    if (!user) {
      showToast('Please sign in to book a class', 'error');
      return;
    }

    setProcessing(classId);

    try {
      await runTransaction(db, async (transaction) => {
        const classRef = doc(db, 'classes', classId);
        const classDoc = await transaction.get(classRef);

        if (!classDoc.exists()) {
          throw new Error('Class not found');
        }

        const classData = classDoc.data() as FirestoreClassData;

        if (classData.enrolledStudents?.includes(user.id)) {
          throw new Error('You are already enrolled in this class');
        }

        if (classData.enrolled >= classData.capacity) {
          throw new Error('Class is full');
        }

        transaction.update(classRef, {
          enrolled: classData.enrolled + 1,
          enrolledStudents: [...(classData.enrolledStudents || []), user.id],
          lastUpdated: Timestamp.now(),
        });
      });

      // Update the local state to reflect the change
      setClasses(prevClasses => 
        prevClasses.map(cls => 
          cls.id === classId
            ? {
                ...cls,
                enrolled: cls.enrolled + 1,
                enrolledStudents: [...(cls.enrolledStudents || []), user.id],
              }
            : cls
        )
      );

      showToast('Successfully booked the class!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to book class', 'error');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Book a Dance Class</h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse and book from our selection of dance classes
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value as DanceStyle | 'ALL')}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            aria-label="Filter by dance style"
          >
            <option value="ALL">All Styles</option>
            {Object.values(DanceStyle).map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as FirestoreClassData['level'] | 'ALL')}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            aria-label="Filter by difficulty level"
          >
            <option value="ALL">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Class Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((danceClass) => {
            const isEnrolled = danceClass.enrolledStudents?.includes(user?.id || '');
            const isFull = danceClass.enrolled >= danceClass.capacity;
            const isProcessing = processing === danceClass.id;

            return (
              <div key={danceClass.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900">{danceClass.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {danceClass.style}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{danceClass.description}</p>
                  <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <p>Level: {danceClass.level}</p>
                    <p>Schedule: {danceClass.schedule}</p>
                    <p>Price: ${danceClass.price}</p>
                    <p>Availability: {danceClass.enrolled} / {danceClass.capacity}</p>
                  </div>
                  <div className="mt-5">
                    <button
                      onClick={() => handleBooking(danceClass.id)}
                      disabled={isEnrolled || isFull || isProcessing}
                      className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                        ${isProcessing ? 'bg-indigo-400' : ''}
                        ${isEnrolled ? 'bg-green-600 cursor-not-allowed' : ''}
                        ${isFull && !isEnrolled ? 'bg-gray-400 cursor-not-allowed' : ''}
                        ${!isEnrolled && !isFull && !isProcessing ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      {isProcessing && (
                        <Loading size="sm" className="mr-2" />
                      )}
                      {isEnrolled ? 'Enrolled' : isFull ? 'Class Full' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {classes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No classes found matching your filters.</p>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loadingMore ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Loading...
                </>
              ) : (
                'Load More Classes'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 