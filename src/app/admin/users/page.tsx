'use client';

import { withRole } from '@/components/auth/withRole';
import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import type { UserRole } from '@/types/next-auth';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
}

function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(usersData);
      } catch (err) {
        setError('Failed to fetch users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
      });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError('Failed to update user role');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-600 text-center p-4">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold mb-6">User Management</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {users.map(user => (
              <li key={user.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium">{user.name}</h2>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">Current role: {user.role}</span>
                    <select
                      id={`role-select-${user.id}`}
                      aria-label={`Change role for ${user.name || 'user'}`}
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="admin">Admin</option>
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                    </select>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default withRole('admin')(UserManagement); 