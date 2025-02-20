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

export interface FirestoreClassData {
  id: string;
  name: string;
  description: string;
  schedule: string;
  capacity: number;
  enrolled: number;
  teacherId: string;
  enrolledStudents: string[];
  style: DanceStyle;
  price: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lastUpdated: Timestamp;
}

export interface FirestoreUserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  lastActive: Timestamp;
}

export interface FirestoreAttendanceRecord {
  date: string;
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