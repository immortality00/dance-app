'use client';

import { withRole } from '@/components/auth/withRole';
import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
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
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: Date;
}

interface Class {
  id: string;
  name: string;
  enrolled: number;
  capacity: number;
  teacherId: string;
}

interface Analytics {
  totalRevenue: number;
  classAttendance: {
    className: string;
    attendanceRate: number;
    totalSessions: number;
  }[];
  studentEngagement: {
    enrolled: number;
    active: number;
    inactive: number;
  };
  popularClasses: {
    name: string;
    enrolled: number;
    capacity: number;
  }[];
  teacherStats: {
    name: string;
    totalStudents: number;
    averageAttendance: number;
  }[];
}

// Add new interface for trend data
interface TrendData {
  labels: string[];
  enrollments: number[];
  attendance: number[];
  revenue: number[];
}

function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: 0,
    classAttendance: [],
    studentEngagement: { enrolled: 0, active: 0, inactive: 0 },
    popularClasses: [],
    teacherStats: [],
  });
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trends, setTrends] = useState<TrendData>({
    labels: [],
    enrollments: [],
    attendance: [],
    revenue: [],
  });

  useEffect(() => {
    fetchAnalytics();
    fetchTrendData();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      // Get all classes
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const classes = classesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Class[];

      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      // Calculate class attendance
      const classAttendance = await Promise.all(
        classes.map(async (cls) => {
          const attendanceSnapshot = await getDocs(collection(db, `classes/${cls.id}/attendance`));
          const sessions = attendanceSnapshot.docs.length;
          const totalAttendance = attendanceSnapshot.docs.reduce(
            (sum, doc) => sum + (doc.data().presentStudents?.length || 0),
            0
          );
          const averageAttendance = sessions > 0 ? totalAttendance / sessions : 0;
          const attendanceRate = cls.enrolled > 0 ? averageAttendance / cls.enrolled : 0;

          return {
            className: cls.name,
            attendanceRate: attendanceRate,
            totalSessions: sessions,
          };
        })
      );

      // Calculate student engagement
      const students = users.filter(user => user.role === 'student');
      const activeThreshold = new Date();
      activeThreshold.setDate(activeThreshold.getDate() - 30); // Active if attended in last 30 days

      const studentEngagement = {
        enrolled: students.length,
        active: students.filter(student => student.lastActive > activeThreshold).length,
        inactive: students.filter(student => student.lastActive <= activeThreshold).length,
      };

      // Get popular classes
      const popularClasses = classes
        .sort((a, b) => (b.enrolled / b.capacity) - (a.enrolled / a.capacity))
        .slice(0, 5)
        .map(cls => ({
          name: cls.name,
          enrolled: cls.enrolled,
          capacity: cls.capacity,
        }));

      // Calculate teacher stats
      const teachers = users.filter(user => user.role === 'teacher');
      const teacherStats = await Promise.all(
        teachers.map(async (teacher) => {
          const teacherClasses = classes.filter(cls => cls.teacherId === teacher.id);
          const totalStudents = teacherClasses.reduce((sum, cls) => sum + cls.enrolled, 0);
          
          let totalAttendance = 0;
          let totalSessions = 0;
          
          for (const cls of teacherClasses) {
            const attendanceSnapshot = await getDocs(collection(db, `classes/${cls.id}/attendance`));
            totalSessions += attendanceSnapshot.docs.length;
            totalAttendance += attendanceSnapshot.docs.reduce(
              (sum, doc) => sum + (doc.data().presentStudents?.length || 0),
              0
            );
          }

          const averageAttendance = totalSessions > 0 ? totalAttendance / totalSessions : 0;

          return {
            name: teacher.name,
            totalStudents,
            averageAttendance,
          };
        })
      );

      setAnalytics({
        totalRevenue: 0, // This would come from your payment processing system
        classAttendance,
        studentEngagement,
        popularClasses,
        teacherStats,
      });
    } catch (err) {
      setError('Failed to fetch analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add new function to fetch trend data
  const fetchTrendData = async () => {
    try {
      const now = new Date();
      const dates = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        return date.toLocaleString('default', { month: 'short' });
      }).reverse();

      // Simulate trend data (replace with actual data fetching)
      const enrollments = dates.map(() => Math.floor(Math.random() * 50 + 20));
      const attendance = dates.map(() => Math.floor(Math.random() * 30 + 60));
      const revenue = dates.map(() => Math.floor(Math.random() * 5000 + 3000));

      setTrends({
        labels: dates,
        enrollments,
        attendance,
        revenue,
      });
    } catch (err) {
      console.error('Failed to fetch trend data:', err);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-600 text-center p-4">{error}</div>;

  // Prepare data for enrollment trends chart
  const enrollmentTrendsData = {
    labels: trends.labels,
    datasets: [
      {
        label: 'New Enrollments',
        data: trends.enrollments,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.1,
      },
    ],
  };

  // Prepare data for revenue trends chart
  const revenueTrendsData = {
    labels: trends.labels,
    datasets: [
      {
        label: 'Monthly Revenue ($)',
        data: trends.revenue,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.1,
      },
    ],
  };

  // Prepare data for student distribution pie chart
  const studentDistributionData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [
          analytics.studentEngagement.active,
          analytics.studentEngagement.inactive,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
          <div className="flex items-center">
            <label htmlFor="timeframe-select" className="sr-only">Select Timeframe</label>
            <select
              id="timeframe-select"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'year')}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              aria-label="Select timeframe for analytics"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Student Engagement Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Student Engagement</h3>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Enrolled</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {analytics.studentEngagement.enrolled}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Active Students</dt>
                  <dd className="mt-1 text-2xl font-semibold text-green-600">
                    {analytics.studentEngagement.active}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Inactive Students</dt>
                  <dd className="mt-1 text-2xl font-semibold text-red-600">
                    {analytics.studentEngagement.inactive}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Popular Classes Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Classes</h3>
              <ul className="space-y-4">
                {analytics.popularClasses.map((cls, index) => (
                  <li key={index}>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">{cls.name}</span>
                      <span className="text-sm text-gray-900">
                        {Math.round((cls.enrolled / cls.capacity) * 100)}% Full
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Class Attendance Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Class Attendance</h3>
              <ul className="space-y-4">
                {analytics.classAttendance.map((cls, index) => (
                  <li key={index}>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">{cls.className}</span>
                      <span className="text-sm text-gray-900">
                        {Math.round(cls.attendanceRate * 100)}% Attendance
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${cls.attendanceRate * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* New Charts Section */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Enrollment Trends */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Enrollment Trends</h3>
            <div className="h-64">
              <Line
                data={enrollmentTrendsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Students',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Revenue Trends */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
            <div className="h-64">
              <Line
                data={revenueTrendsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Revenue ($)',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Student Distribution */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Student Distribution</h3>
            <div className="h-64">
              <Pie
                data={studentDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Class Popularity */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Class Popularity</h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: analytics.popularClasses.map(cls => cls.name),
                  datasets: [
                    {
                      label: 'Enrolled Students',
                      data: analytics.popularClasses.map(cls => cls.enrolled),
                      backgroundColor: 'rgba(99, 102, 241, 0.5)',
                      borderColor: 'rgb(99, 102, 241)',
                      borderWidth: 1,
                    },
                    {
                      label: 'Capacity',
                      data: analytics.popularClasses.map(cls => cls.capacity),
                      backgroundColor: 'rgba(209, 213, 219, 0.5)',
                      borderColor: 'rgb(209, 213, 219)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Students',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Teacher Performance */}
        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Teacher Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Students
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Attendance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.teacherStats.map((teacher, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {teacher.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.totalStudents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round(teacher.averageAttendance * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRole('admin')(AnalyticsDashboard); 