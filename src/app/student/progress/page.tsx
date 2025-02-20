'use client';

import { withRole } from '@/components/auth/withRole';
import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AttendanceData {
  date: string;
  present: boolean;
}

interface ClassProgress {
  classId: string;
  className: string;
  attendanceRate: number;
  attendanceHistory: AttendanceData[];
  totalClasses: number;
  classesAttended: number;
}

function StudentProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ClassProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchStudentProgress();
    }
  }, [user]);

  const fetchStudentProgress = async () => {
    if (!user) return;

    try {
      // Get all classes the student is enrolled in
      const classesSnapshot = await getDocs(
        query(collection(db, 'classes'), where('enrolledStudents', 'array-contains', user.id))
      );

      const progressData = await Promise.all(
        classesSnapshot.docs.map(async (classDoc) => {
          const classData = classDoc.data();
          
          // Get attendance records for this class
          const attendanceSnapshot = await getDocs(collection(db, `classes/${classDoc.id}/attendance`));
          const attendanceHistory = attendanceSnapshot.docs.map(doc => ({
            date: doc.id,
            present: (doc.data().presentStudents || []).includes(user.id),
          })).sort((a, b) => a.date.localeCompare(b.date));

          const totalClasses = attendanceHistory.length;
          const classesAttended = attendanceHistory.filter(record => record.present).length;
          const attendanceRate = totalClasses > 0 ? (classesAttended / totalClasses) * 100 : 0;

          return {
            classId: classDoc.id,
            className: classData.name,
            attendanceRate,
            attendanceHistory,
            totalClasses,
            classesAttended,
          };
        })
      );

      setProgress(progressData);
    } catch (err) {
      setError('Failed to fetch progress data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-600 text-center p-4">{error}</div>;

  // Prepare data for the attendance rate chart
  const attendanceChartData = {
    labels: progress.map(p => p.className),
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: progress.map(p => p.attendanceRate),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for the attendance history line chart
  const attendanceHistoryData = {
    labels: progress[0]?.attendanceHistory.map(h => h.date) || [],
    datasets: progress.map((p, index) => ({
      label: p.className,
      data: p.attendanceHistory.map(h => h.present ? 100 : 0),
      borderColor: `hsl(${index * 360 / progress.length}, 70%, 50%)`,
      tension: 0.1,
      fill: false,
    })),
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold mb-6">Your Progress</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Overall Progress Cards */}
          {progress.map((classProgress) => (
            <div key={classProgress.classId} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{classProgress.className}</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Attendance Rate</dt>
                    <dd className="mt-1 text-2xl font-semibold text-indigo-600">
                      {Math.round(classProgress.attendanceRate)}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Classes Attended</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {classProgress.classesAttended} / {classProgress.totalClasses}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ))}
        </div>

        {/* Attendance Rate Chart */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Rate by Class</h3>
          <div className="h-64">
            <Bar
              data={attendanceChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Attendance Rate (%)',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Attendance History Chart */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance History</h3>
          <div className="h-64">
            <Line
              data={attendanceHistoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Present (%)',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRole('student')(StudentProgress); 