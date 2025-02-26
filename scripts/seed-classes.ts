import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { DanceStyle } from '../src/types/firebase';

// Initialize Firebase with minimal config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Sample class data
const sampleClasses = [
  {
    name: 'Beginner Ballet',
    description: 'Introduction to classical ballet techniques and movements',
    teacherId: 'instructor1',
    schedule: '10:00 AM - 11:30 AM',
    date: new Date('2024-03-25'),
    duration: 90,
    capacity: 15,
    enrolled: 0,
    enrolledStudents: [],
    price: 45,
    level: 'beginner',
    style: DanceStyle.BALLET,
    location: 'Studio A',
  },
  {
    name: 'Hip Hop Fundamentals',
    description: 'Learn the basics of hip hop dance and street style',
    teacherId: 'instructor2',
    schedule: '2:00 PM - 3:00 PM',
    date: new Date('2024-03-26'),
    duration: 60,
    capacity: 20,
    enrolled: 0,
    enrolledStudents: [],
    price: 35,
    level: 'beginner',
    style: DanceStyle.HIP_HOP,
    location: 'Studio B',
  },
  {
    name: 'Advanced Contemporary',
    description: 'Advanced contemporary dance techniques and choreography',
    teacherId: 'instructor3',
    schedule: '4:00 PM - 5:30 PM',
    date: new Date('2024-03-27'),
    duration: 90,
    capacity: 12,
    enrolled: 0,
    enrolledStudents: [],
    price: 50,
    level: 'advanced',
    style: DanceStyle.CONTEMPORARY,
    location: 'Studio C',
  },
  {
    name: 'Salsa Social Dance',
    description: 'Learn salsa dance moves and partner work',
    teacherId: 'instructor4',
    schedule: '7:00 PM - 8:30 PM',
    date: new Date('2024-03-28'),
    duration: 90,
    capacity: 24,
    enrolled: 0,
    enrolledStudents: [],
    price: 40,
    level: 'intermediate',
    style: DanceStyle.SALSA,
    location: 'Studio A',
  },
  {
    name: 'Jazz Dance Workshop',
    description: 'Energetic jazz dance combinations and techniques',
    teacherId: 'instructor5',
    schedule: '11:00 AM - 12:00 PM',
    date: new Date('2024-03-29'),
    duration: 60,
    capacity: 18,
    enrolled: 0,
    enrolledStudents: [],
    price: 35,
    level: 'intermediate',
    style: DanceStyle.JAZZ,
    location: 'Studio B',
  }
];

async function seedClasses() {
  try {
    console.log('Starting class seeding...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Add each class to Firestore
    for (const classData of sampleClasses) {
      const docData = {
        ...classData,
        date: Timestamp.fromDate(classData.date),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastUpdated: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'classes'), docData);
      console.log(`Added class: ${classData.name} with ID: ${docRef.id}`);
    }

    console.log('Successfully seeded all classes!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding classes:', error);
    process.exit(1);
  }
}

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Run the seeding
seedClasses(); 