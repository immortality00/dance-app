'use client';

import { withRole } from '@/components/auth/withRole';
import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalClasses: number;
  activeStudents: number;
  totalTeachers: number;
  revenue: number;
}

function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalClasses: 0,
    activeStudents: 0,
    totalTeachers: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersSnapshot, classesSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'classes')),
        ]);

        const users = usersSnapshot.docs.map(doc => doc.data());
        const teachers = users.filter(user => user.role === 'teacher');
        const students = users.filter(user => user.role === 'student');

        setStats({
          totalUsers: users.length,
          totalClasses: classesSnapshot.size,
          activeStudents: students.length,
          totalTeachers: teachers.length,
          revenue: 0, // This would come from your payment processing system
        });
      } catch (err) {
        setError('Failed to fetch statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-600 text-center p-4">{error}</div>;

  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      href: '/admin/users',
      color: 'bg-blue-500',
    },
    {
      title: 'Active Classes',
      value: stats.totalClasses,
      href: '/admin/classes',
      color: 'bg-green-500',
    },
    {
      title: 'Students',
      value: stats.activeStudents,
      href: '/admin/students',
      color: 'bg-purple-500',
    },
    {
      title: 'Teachers',
      value: stats.totalTeachers,
      href: '/admin/teachers',
      color: 'bg-yellow-500',
    },
    {
      title: 'Revenue',
      value: `$${stats.revenue.toFixed(2)}`,
      href: '/admin/finance',
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
              className="block"
            >
              <div className={`${card.color} overflow-hidden shadow rounded-lg`}>
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-white truncate">
                    {card.title}
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-white">
                    {card.value}
                  </dd>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quick Actions
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link
                href="/admin/users"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Manage Users
              </Link>
              <Link
                href="/admin/classes"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Manage Classes
              </Link>
              <Link
                href="/admin/finance"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                View Finances
              </Link>
              <Link
                href="/admin/settings"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                System Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRole('admin')(AdminDashboard); 