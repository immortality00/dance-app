'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useTranslations } from 'next-intl';
import { Loading } from '@/components/Loading';
import { useToast } from '@/components/Toast';
import type { FirestoreClassData } from '@/types/firebase';

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
  };
}

interface AttendanceRecord {
  classId: string;
  className: string;
  date: Timestamp;
  status: 'present' | 'absent';
}

export default function UserProfilePage() {
  const { user } = useAuth();
  const t = useTranslations('Profile');
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    language: 'en',
    notifications: {
      email: true,
      sms: false,
    },
  });
  
  const [upcomingClasses, setUpcomingClasses] = useState<FirestoreClassData[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUpcomingClasses();
      fetchAttendanceHistory();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      if (!user?.id) return;
      
      const userDocRef = doc(db, 'users', user.id);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        setProfile(prev => ({
          ...prev,
          ...userDocSnap.data(),
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      showToast(t('errors.fetchProfile'), 'error');
    }
  };

  const fetchUpcomingClasses = async () => {
    try {
      if (!user?.id) return;

      const now = new Date();
      const classesQuery = query(
        collection(db, 'classes'),
        where('enrolledStudents', 'array-contains', user.id),
        where('date', '>=', now)
      );

      const snapshot = await getDocs(classesQuery);
      const classes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreClassData[];

      setUpcomingClasses(classes.sort((a, b) => 
        a.date.toMillis() - b.date.toMillis()
      ));
    } catch (error) {
      console.error('Error fetching upcoming classes:', error);
      showToast(t('errors.fetchClasses'), 'error');
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      if (!user?.id) return;

      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('studentId', '==', user.id),
        where('date', '<=', new Date())
      );

      const snapshot = await getDocs(attendanceQuery);
      const attendance = snapshot.docs.map(doc => ({
        ...doc.data(),
      })) as AttendanceRecord[];

      setAttendanceHistory(attendance.sort((a, b) => 
        b.date.toMillis() - a.date.toMillis()
      ));
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      showToast(t('errors.fetchAttendance'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      if (!user?.id) return;
      
      setSaving(true);
      await updateDoc(doc(db, 'users', user.id), {
        ...profile,
        updatedAt: new Date(),
      });
      
      showToast(t('success.profileUpdate'), 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(t('errors.updateProfile'), 'error');
    } finally {
      setSaving(false);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">{t('sections.personalInfo')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('fields.name')}
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    aria-label={t('fields.name')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('fields.email')}
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    aria-label={t('fields.email')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('fields.phone')}
                  </label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    aria-label={t('fields.phone')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('fields.language')}
                  </label>
                  <select
                    value={profile.language}
                    onChange={(e) => setProfile(prev => ({ ...prev, language: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    aria-label={t('fields.language')}
                  >
                    <option value="en">{t('languages.english')}</option>
                    <option value="es">{t('languages.spanish')}</option>
                    <option value="fr">{t('languages.french')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('fields.notifications')}
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.notifications.email}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          email: e.target.checked,
                        },
                      }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      aria-label={t('notifications.email')}
                    />
                    <span className="ml-2 text-sm text-gray-600">{t('notifications.email')}</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.notifications.sms}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          sms: e.target.checked,
                        },
                      }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      aria-label={t('notifications.sms')}
                    />
                    <span className="ml-2 text-sm text-gray-600">{t('notifications.sms')}</span>
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={saving}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {saving ? (
                      <>
                        <Loading size="sm" className="mr-2" />
                        {t('buttons.saving')}
                      </>
                    ) : (
                      t('buttons.saveChanges')
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Classes and Attendance */}
          <div className="space-y-6">
            {/* Upcoming Classes */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">{t('sections.upcomingClasses')}</h2>
              {upcomingClasses.length > 0 ? (
                <div className="space-y-4">
                  {upcomingClasses.map((classData) => (
                    <div key={classData.id} className="border-l-4 border-indigo-500 pl-4">
                      <h3 className="font-medium">{classData.name}</h3>
                      <p className="text-sm text-gray-600">{classData.schedule}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">{t('messages.noUpcomingClasses')}</p>
              )}
            </div>

            {/* Attendance History */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">{t('sections.attendance')}</h2>
              {attendanceHistory.length > 0 ? (
                <div className="space-y-4">
                  {attendanceHistory.map((record, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{record.className}</h3>
                        <p className="text-sm text-gray-600">
                          {record.date.toDate().toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        record.status === 'present' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {t(`attendance.${record.status}`)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">{t('messages.noAttendanceRecords')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 