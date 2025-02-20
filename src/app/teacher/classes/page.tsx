'use client';

import { withRole } from '@/components/auth/withRole';
import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

interface DanceClass {
  id: string;
  name: string;
  description: string;
  schedule: string;
  capacity: number;
  enrolled: number;
  teacherId: string;
}

function ClassManagement() {
  const [classes, setClasses] = useState<DanceClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    schedule: '',
    capacity: 10,
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const classesData = classesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as DanceClass[];
      setClasses(classesData);
    } catch (err) {
      setError('Failed to fetch classes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addClass = async () => {
    try {
      const docRef = await addDoc(collection(db, 'classes'), {
        ...newClass,
        enrolled: 0,
      });
      setClasses([...classes, { ...newClass, id: docRef.id, enrolled: 0 } as DanceClass]);
      setIsAddingClass(false);
      setNewClass({ name: '', description: '', schedule: '', capacity: 10 });
    } catch (err) {
      setError('Failed to add class');
      console.error(err);
    }
  };

  const deleteClass = async (classId: string) => {
    try {
      await deleteDoc(doc(db, 'classes', classId));
      setClasses(classes.filter(c => c.id !== classId));
    } catch (err) {
      setError('Failed to delete class');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-600 text-center p-4">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Class Management</h1>
          <button
            onClick={() => setIsAddingClass(true)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add New Class
          </button>
        </div>

        {isAddingClass && (
          <div className="mb-8 bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Add New Class</h2>
            <form onSubmit={(e) => { e.preventDefault(); addClass(); }} className="space-y-4">
              <div>
                <label htmlFor="class-name" className="block text-sm font-medium text-gray-700">
                  Class Name
                </label>
                <input
                  id="class-name"
                  type="text"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter class name"
                  required
                />
              </div>
              <div>
                <label htmlFor="class-description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="class-description"
                  value={newClass.description}
                  onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter class description"
                  required
                />
              </div>
              <div>
                <label htmlFor="class-schedule" className="block text-sm font-medium text-gray-700">
                  Schedule
                </label>
                <input
                  id="class-schedule"
                  type="text"
                  value={newClass.schedule}
                  onChange={(e) => setNewClass({ ...newClass, schedule: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., Monday 18:00-19:00"
                  required
                />
              </div>
              <div>
                <label htmlFor="class-capacity" className="block text-sm font-medium text-gray-700">
                  Capacity
                </label>
                <input
                  id="class-capacity"
                  type="number"
                  min="1"
                  value={newClass.capacity}
                  onChange={(e) => setNewClass({ ...newClass, capacity: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsAddingClass(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Class
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {classes.map(danceClass => (
              <li key={danceClass.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">{danceClass.name}</h2>
                    <p className="text-sm text-gray-500">{danceClass.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Schedule: {danceClass.schedule}</p>
                      <p>Enrolled: {danceClass.enrolled} / {danceClass.capacity}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteClass(danceClass.id)}
                    className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    aria-label={`Delete ${danceClass.name}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default withRole(['admin', 'teacher'])(ClassManagement); 