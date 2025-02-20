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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SAMPLE_CLASSES = [
  {
    name: 'Introduction to Ballet',
    description: 'Perfect for beginners looking to start their ballet journey. Learn basic positions and movements.',
    style: DanceStyle.BALLET,
    level: 'Beginner',
    schedule: 'Monday and Wednesday, 9:00 AM - 10:30 AM',
    capacity: 15,
    price: 50,
  },
  {
    name: 'Advanced Contemporary',
    description: 'Advanced level contemporary dance class for experienced dancers. Explore complex choreography and expression.',
    style: DanceStyle.CONTEMPORARY,
    level: 'Advanced',
    schedule: 'Tuesday and Thursday, 5:00 PM - 6:30 PM',
    capacity: 12,
    price: 45,
  },
  {
    name: 'Hip Hop Fundamentals',
    description: 'Learn the basics of hip hop dance, including popping, locking, and basic footwork.',
    style: DanceStyle.HIP_HOP,
    level: 'Beginner',
    schedule: 'Monday and Friday, 6:00 PM - 7:00 PM',
    capacity: 20,
    price: 40,
  },
  {
    name: 'Intermediate Jazz',
    description: 'Build upon your jazz dance foundation with more complex combinations and techniques.',
    style: DanceStyle.JAZZ,
    level: 'Intermediate',
    schedule: 'Wednesday and Friday, 4:00 PM - 5:30 PM',
    capacity: 15,
    price: 45,
  },
  {
    name: 'Ballroom Dance',
    description: 'Learn classic ballroom dances including waltz, foxtrot, and tango.',
    style: DanceStyle.BALLROOM,
    level: 'Beginner',
    schedule: 'Saturday, 2:00 PM - 4:00 PM',
    capacity: 24,
    price: 55,
  },
  {
    name: 'Salsa Social Dancing',
    description: 'Master the art of salsa dancing with emphasis on social dancing skills.',
    style: DanceStyle.SALSA,
    level: 'Intermediate',
    schedule: 'Friday, 7:00 PM - 8:30 PM',
    capacity: 30,
    price: 45,
  },
  {
    name: 'Advanced Tap Workshop',
    description: 'Advanced tap dancing techniques and complex rhythm combinations.',
    style: DanceStyle.TAP,
    level: 'Advanced',
    schedule: 'Thursday, 6:00 PM - 7:30 PM',
    capacity: 12,
    price: 40,
  },
  {
    name: 'Breakdancing Basics',
    description: 'Introduction to breakdancing fundamentals and basic power moves.',
    style: DanceStyle.BREAKDANCING,
    level: 'Beginner',
    schedule: 'Saturday, 11:00 AM - 12:30 PM',
    capacity: 15,
    price: 45,
  },
];

async function seedClasses() {
  try {
    console.log('Starting to seed classes...');
    
    for (const classData of SAMPLE_CLASSES) {
      try {
        const docRef = await addDoc(collection(db, 'classes'), {
          ...classData,
          enrolled: 0,
          enrolledStudents: [],
          teacherId: 'sample-teacher', // You can update this with actual teacher IDs
          lastUpdated: Timestamp.now(),
        });
        console.log(`Added class: ${classData.name} (${docRef.id})`);
      } catch (err) {
        console.error(`Error adding class ${classData.name}:`, err);
      }
    }

    console.log('\nSeeding completed!');
    console.log(`Added ${SAMPLE_CLASSES.length} sample classes`);

  } catch (error) {
    console.error('Seeding failed:', error);
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