import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config();

const requiredVars = [
  'NEXT_PUBLIC_APP_URL',
  'NODE_ENV',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'DATABASE_URL'
];

console.log('Checking environment variables...\n');

let missingVars = false;

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.log(`❌ Missing: ${varName}`);
    missingVars = true;
  } else {
    console.log(`✅ Found: ${varName}`);
  }
}

if (missingVars) {
  console.log('\n❌ Some required environment variables are missing!');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are present!');
} 