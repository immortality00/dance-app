'use client';

import { withRole } from '@/components/auth/withRole';
import { useState, useEffect, useReducer } from 'react';
import { db } from '@/config/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { sendEmail, emailTemplates } from '@/lib/email';
import type { FirestoreClassData, FirestoreUserData, FirestoreAttendanceRecord } from '@/types/firebase';
import type { AttendanceStatus } from '@/lib/email';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface AttendanceRecord {
  date: string;
  presentStudents: string[];
}

interface AttendanceState {
  selectedDate: string;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  loading: boolean;
  error: string | null;
}

type AttendanceAction =
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_STUDENTS'; payload: Student[] }
  | { type: 'SET_RECORDS'; payload: AttendanceRecord[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_ATTENDANCE'; payload: { date: string; presentStudents: string[] } };

function attendanceReducer(state: AttendanceState, action: AttendanceAction): AttendanceState {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_STUDENTS':
      return { ...state, students: action.payload };
    case 'SET_RECORDS':
      return { ...state, attendanceRecords: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_ATTENDANCE':
      return {
        ...state,
        attendanceRecords: state.attendanceRecords.map(record =>
          record.date === action.payload.date
            ? { ...record, presentStudents: action.payload.presentStudents }
            : record
        ),
      };
    default:
      return state;
  }
}

function AttendanceTracking() {
  const params = useParams();
  const classId = params.id as string;

  const [state, dispatch] = useReducer(attendanceReducer, {
    selectedDate: new Date().toISOString().split('T')[0],
    students: [],
    attendanceRecords: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const classDoc = await getDoc(doc(db, 'classes', classId));
      if (!classDoc.exists()) {
        dispatch({ type: 'SET_ERROR', payload: 'Class not found' });
        return;
      }

      const classData = classDoc.data() as FirestoreClassData;
      const enrolledStudentIds = classData.enrolledStudents || [];

      const studentsData: Student[] = [];
      for (const studentId of enrolledStudentIds) {
        const studentDoc = await getDoc(doc(db, 'users', studentId));
        if (studentDoc.exists()) {
          const userData = studentDoc.data() as FirestoreUserData;
          studentsData.push({
            id: studentDoc.id,
            name: userData.name,
            email: userData.email,
          });
        }
      }
      dispatch({ type: 'SET_STUDENTS', payload: studentsData });

      const attendanceSnapshot = await getDocs(collection(db, `classes/${classId}/attendance`));
      const records = attendanceSnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreAttendanceRecord;
        return {
          date: doc.id,
          presentStudents: data.presentStudents || [],
        };
      });
      dispatch({ type: 'SET_RECORDS', payload: records });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch class data' });
      console.error(err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_DATE', payload: e.target.value });
  };

  const updateAttendance = async (studentId: string, isPresent: boolean) => {
    try {
      const attendanceRef = doc(db, `classes/${classId}/attendance/${state.selectedDate}`);
      const record = state.attendanceRecords.find(r => r.date === state.selectedDate) || 
        { date: state.selectedDate, presentStudents: [] };
      
      let updatedPresentStudents = [...record.presentStudents];
      if (isPresent && !updatedPresentStudents.includes(studentId)) {
        updatedPresentStudents.push(studentId);
      } else if (!isPresent) {
        updatedPresentStudents = updatedPresentStudents.filter(id => id !== studentId);
      }

      await updateDoc(attendanceRef, {
        presentStudents: updatedPresentStudents,
        lastUpdated: Timestamp.now(),
      });

      dispatch({
        type: 'UPDATE_ATTENDANCE',
        payload: { date: state.selectedDate, presentStudents: updatedPresentStudents },
      });

      // Get class and student details for the email
      const classDoc = await getDoc(doc(db, 'classes', classId));
      const studentDoc = await getDoc(doc(db, 'users', studentId));
      
      if (classDoc.exists() && studentDoc.exists()) {
        const classData = classDoc.data() as FirestoreClassData;
        const userData = studentDoc.data() as FirestoreUserData;

        if (userData.email) {
          const formattedDate = new Date(state.selectedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          const attendanceStatus: AttendanceStatus = isPresent ? 'present' : 'absent';
          const emailData = emailTemplates.attendanceUpdate(
            classData.name || 'Class',
            formattedDate,
            attendanceStatus
          );
        
          await sendEmail({
            to: userData.email,
            subject: emailData.subject,
            text: emailData.text,
            html: emailData.html,
          });
        }
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update attendance' });
      console.error(err);
    }
  };

  if (state.loading) return <div className="text-center p-4">Loading...</div>;
  if (state.error) return <div className="text-red-600 text-center p-4">{state.error}</div>;

  const currentRecord = state.attendanceRecords.find(r => r.date === state.selectedDate) || 
    { date: state.selectedDate, presentStudents: [] };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Attendance Tracking</h1>
          <div className="flex items-center">
            <label htmlFor="attendance-date" className="sr-only">Select Date</label>
            <input
              id="attendance-date"
              type="date"
              value={state.selectedDate}
              onChange={handleDateChange}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              aria-label="Select date for attendance"
            />
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {state.students.map(student => {
              const isPresent = currentRecord.presentStudents.includes(student.id);
              
              return (
                <li key={student.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => updateAttendance(student.id, !isPresent)}
                        className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                          isPresent
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-400 hover:bg-gray-500'
                        }`}
                      >
                        {isPresent ? 'Present' : 'Absent'}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Attendance Summary</h2>
          <p className="text-sm text-gray-500">
            Present: {currentRecord.presentStudents.length} / {state.students.length} students
            ({Math.round((currentRecord.presentStudents.length / state.students.length) * 100) || 0}%)
          </p>
        </div>
      </div>
    </div>
  );
}

export default withRole(['admin', 'teacher'])(AttendanceTracking); 