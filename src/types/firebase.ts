import { Timestamp } from 'firebase/firestore';

export enum DanceStyle {
  BALLET = 'Ballet',
  CONTEMPORARY = 'Contemporary',
  HIP_HOP = 'Hip Hop',
  JAZZ = 'Jazz',
  BALLROOM = 'Ballroom',
  SALSA = 'Salsa',
  TAP = 'Tap',
  BREAKDANCING = 'Breakdancing'
}

export interface FirestoreUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'teacher' | 'admin';
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreClassData {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  schedule: string;
  date: Timestamp;
  duration: number; // in minutes
  capacity: number;
  enrolled: number;
  enrolledStudents: string[]; // array of user IDs
  waitlist: string[]; // array of user IDs
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  style: string;
  location: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastUpdated: Timestamp;
}

export interface FirestoreUserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  lastActive: Timestamp;
}

export type AttendanceStatus = 'present' | 'absent';

export interface FirestoreAttendanceRecord {
  id: string;
  classId: string;
  className: string;
  studentId: string;
  date: Timestamp;
  status: 'present' | 'absent';
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  presentStudents: string[];
  lastUpdated: Timestamp;
}

export interface FirestoreStudioRental {
  id: string;
  userId: string;
  userName: string;
  studioId: string;
  date: Timestamp;
  startTime: string; // 24-hour format HH:mm
  endTime: string; // 24-hour format HH:mm
  purpose: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Timestamp;
  lastUpdated: Timestamp;
} 