'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/config/firebase';
import { collection, getDocs, doc, runTransaction } from 'firebase/firestore';
import { generateNomodDeepLink } from '@/lib/payment';
import { useToast } from '@/components/Toast';
import { Loading } from '@/components/Loading';
import type { FirestoreClassData } from '@/types/firebase';

export default function ClassBooking() {
  const [classes, setClasses] = useState<FirestoreClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const classesData = classesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreClassData[];
      setClasses(classesData);
    } catch (error) {
      showToast('Failed to fetch classes', 'error');
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (classData: FirestoreClassData) => {
    if (!user) {
      showToast('Please sign in to book a class', 'error');
      return;
    }

    try {
      setProcessingPayment(classData.id);

      // Check if user is already enrolled
      if (classData.enrolledStudents?.includes(user.id)) {
        showToast('You are already enrolled in this class', 'warning');
        return;
      }

      // Check if class is full
      if (classData.enrolled >= classData.capacity) {
        showToast('This class is full', 'error');
        return;
      }

      // Generate Nomod deep link for payment
      const deepLink = generateNomodDeepLink(classData, user.id);

      // Open Nomod payment link
      window.location.href = deepLink;

    } catch (error: any) {
      showToast(error.message || 'Failed to process booking', 'error');
      console.error('Booking error:', error);
    } finally {
      setProcessingPayment(null);
    }
  };

  const isEnrolled = (classData: FirestoreClassData) => {
    return user && classData.enrolledStudents?.includes(user.id);
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
        <h1 className="text-2xl font-semibold mb-6">Available Classes</h1>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((classData) => (
            <div key={classData.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">{classData.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{classData.description}</p>
                <div className="mt-4">
                  <p className="text-sm text-gray-700">Schedule: {classData.schedule}</p>
                  <p className="text-sm text-gray-700">Style: {classData.style}</p>
                  <p className="text-sm text-gray-700">Level: {classData.level}</p>
                  <p className="text-sm text-gray-700">
                    Availability: {classData.enrolled}/{classData.capacity} enrolled
                  </p>
                  <p className="mt-2 text-lg font-medium text-gray-900">
                    ${classData.price.toFixed(2)}
                  </p>
                </div>
                <div className="mt-5">
                  <button
                    onClick={() => handleBooking(classData)}
                    disabled={processingPayment === classData.id || 
                             isEnrolled(classData) || 
                             classData.enrolled >= classData.capacity}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                      ${isEnrolled(classData)
                        ? 'bg-green-600 cursor-not-allowed'
                        : classData.enrolled >= classData.capacity
                        ? 'bg-gray-400 cursor-not-allowed'
                        : processingPayment === classData.id
                        ? 'bg-indigo-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                  >
                    {processingPayment === classData.id ? (
                      <>
                        <Loading size="sm" className="mr-2" />
                        Processing...
                      </>
                    ) : isEnrolled(classData) ? (
                      'Enrolled'
                    ) : classData.enrolled >= classData.capacity ? (
                      'Class Full'
                    ) : (
                      'Book Now'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 