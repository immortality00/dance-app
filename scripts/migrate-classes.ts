import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
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

const DEFAULT_PRICES = {
  [DanceStyle.BALLET]: 50,
  [DanceStyle.CONTEMPORARY]: 45,
  [DanceStyle.HIP_HOP]: 40,
  [DanceStyle.JAZZ]: 45,
  [DanceStyle.BALLROOM]: 55,
  [DanceStyle.SALSA]: 45,
  [DanceStyle.TAP]: 40,
  [DanceStyle.BREAKDANCING]: 45,
};

async function migrateClasses() {
  try {
    console.log('Starting class migration...');
    
    // Get all classes
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    const totalClasses = classesSnapshot.size;
    console.log(`Found ${totalClasses} classes to migrate`);

    let updated = 0;
    let errors = 0;

    // Update each class
    for (const classDoc of classesSnapshot.docs) {
      try {
        const classData = classDoc.data();
        const classRef = doc(db, 'classes', classDoc.id);

        // Determine dance style based on class name or description
        const nameAndDesc = (classData.name + ' ' + classData.description).toLowerCase();
        let style = DanceStyle.CONTEMPORARY; // Default style

        for (const [key, value] of Object.entries(DanceStyle)) {
          if (nameAndDesc.includes(value.toLowerCase())) {
            style = value as DanceStyle;
            break;
          }
        }

        // Determine level based on description
        let level: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';
        const lowerDesc = classData.description.toLowerCase();
        if (lowerDesc.includes('beginner') || lowerDesc.includes('basic')) {
          level = 'Beginner';
        } else if (lowerDesc.includes('advanced') || lowerDesc.includes('expert')) {
          level = 'Advanced';
        }

        // Update the document with new fields
        await updateDoc(classRef, {
          style,
          price: DEFAULT_PRICES[style],
          level,
          lastUpdated: Timestamp.now(),
          enrolledStudents: classData.enrolledStudents || [],
        });

        updated++;
        console.log(`Updated class: ${classData.name} (${updated}/${totalClasses})`);
      } catch (err) {
        errors++;
        console.error(`Error updating class ${classDoc.id}:`, err);
      }
    }

    console.log('\nMigration completed!');
    console.log(`Successfully updated: ${updated} classes`);
    console.log(`Errors encountered: ${errors} classes`);

  } catch (error) {
    console.error('Migration failed:', error);
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

// Run the migration
migrateClasses(); 