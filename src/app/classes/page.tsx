'use client';

import { withRole } from '@/components/auth/withRole';
import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { sendEmail, emailTemplates } from '@/lib/email';

interface DanceClass {
  id: string;
  name: string;
  description: string;
  schedule: string;
  capacity: number;
  enrolled: number;
  teacherId: string;
  enrolledStudents?: string[];
}

function ClassBooking() {
  const [classes, setClasses] = useState<DanceClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const classesData = classesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        enrolledStudents: doc.data().enrolledStudents || [],
      })) as DanceClass[];
      setClasses(classesData);
    } catch (err) {
      setError('Failed to fetch classes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const enrollInClass = async (classId: string) => {
    if (!user) return;

    try {
      const classRef = doc(db, 'classes', classId);
      const classData = classes.find(c => c.id === classId);
      
      if (!classData) return;
      
      if (classData.enrolled >= classData.capacity) {
        setError('Class is full');
        return;
      }

      if (classData.enrolledStudents?.includes(user.id)) {
        setError('You are already enrolled in this class');
        return;
      }

      await updateDoc(classRef, {
        enrolled: classData.enrolled + 1,
        enrolledStudents: [...(classData.enrolledStudents || []), user.id],
      });

      setClasses(classes.map(c => 
        c.id === classId 
          ? { 
              ...c, 
              enrolled: c.enrolled + 1,
              enrolledStudents: [...(c.enrolledStudents || []), user.id],
            } 
          : c
      ));

      // Send enrollment confirmation email
      if (user.email) {
        const template = emailTemplates.classEnrollment(classData.name);
        await sendEmail({
          to: user.email,
          ...template,
        });
      }

      setError(null);
    } catch (err) {
      setError('Failed to enroll in class');
      console.error(err);
    }
  };

  const unenrollFromClass = async (classId: string) => {
    if (!user) return;

    try {
      const classRef = doc(db, 'classes', classId);
      const classData = classes.find(c => c.id === classId);
      
      if (!classData) return;

      if (!classData.enrolledStudents?.includes(user.id)) {
        setError('You are not enrolled in this class');
        return;
      }

      await updateDoc(classRef, {
        enrolled: classData.enrolled - 1,
        enrolledStudents: classData.enrolledStudents.filter(id => id !== user.id),
      });

      setClasses(classes.map(c => 
        c.id === classId 
          ? { 
              ...c, 
              enrolled: c.enrolled - 1,
              enrolledStudents: c.enrolledStudents?.filter(id => id !== user.id) || [],
            } 
          : c
      ));

      // Send unenrollment notification email
      if (user.email) {
        const template = emailTemplates.classUpdate(
          classData.name,
          'Class Unenrollment',
          'You have been successfully unenrolled from this class.'
        );
        await sendEmail({
          to: user.email,
          ...template,
        });
      }

      setError(null);
    } catch (err) {
      setError('Failed to unenroll from class');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-600 text-center p-4">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold mb-6">Available Classes</h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map(danceClass => {
            const isEnrolled = danceClass.enrolledStudents?.includes(user?.id || '');
            const isFull = danceClass.enrolled >= danceClass.capacity;

            return (
              <div key={danceClass.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">{danceClass.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{danceClass.description}</p>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Schedule: {danceClass.schedule}</p>
                    <p>Availability: {danceClass.enrolled} / {danceClass.capacity}</p>
                  </div>
                  <div className="mt-5">
                    {isEnrolled ? (
                      <button
                        onClick={() => unenrollFromClass(danceClass.id)}
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Unenroll
                      </button>
                    ) : (
                      <button
                        onClick={() => enrollInClass(danceClass.id)}
                        disabled={isFull}
                        className={`w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          isFull 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        }`}
                      >
                        {isFull ? 'Class Full' : 'Enroll'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default withRole(['student', 'teacher'])(ClassBooking); 