import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const db = admin.firestore();

// Sample data for the last 6 months
const MONTHS = 6;
const START_DATE = new Date();
START_DATE.setMonth(START_DATE.getMonth() - MONTHS + 1);
START_DATE.setDate(1); // Start from the first of the month

// Payment types and their price ranges
const PAYMENT_TYPES = {
  class: { min: 40, max: 60 },
  rental: { min: 80, max: 120 },
};

// Expense categories and their typical ranges
const EXPENSE_CATEGORIES = {
  'Utilities': { min: 800, max: 1200 },
  'Maintenance': { min: 300, max: 800 },
  'Staff Salaries': { min: 3000, max: 4000 },
  'Marketing': { min: 500, max: 1000 },
  'Insurance': { min: 400, max: 600 },
  'Equipment': { min: 200, max: 1000 },
  'Cleaning': { min: 300, max: 500 },
};

// Helper function to generate random number between min and max
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Helper function to generate random date within a month
function randomDateInMonth(year: number, month: number): Date {
  const date = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  date.setDate(randomBetween(1, lastDay));
  return date;
}

async function seedFinancialData() {
  try {
    console.log('Starting to seed financial data...');
    let totalPayments = 0;
    let totalExpenses = 0;

    // Generate payments for each month
    for (let i = 0; i < MONTHS; i++) {
      const currentDate = new Date(START_DATE);
      currentDate.setMonth(START_DATE.getMonth() + i);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Generate class payments (30-50 per month)
      const classPaymentsCount = randomBetween(30, 50);
      for (let j = 0; j < classPaymentsCount; j++) {
        const amount = randomBetween(PAYMENT_TYPES.class.min, PAYMENT_TYPES.class.max);
        await db.collection('payments').add({
          type: 'class',
          amount,
          date: admin.firestore.Timestamp.fromDate(randomDateInMonth(year, month)),
        });
        totalPayments++;
      }

      // Generate rental payments (15-25 per month)
      const rentalPaymentsCount = randomBetween(15, 25);
      for (let j = 0; j < rentalPaymentsCount; j++) {
        const amount = randomBetween(PAYMENT_TYPES.rental.min, PAYMENT_TYPES.rental.max);
        await db.collection('payments').add({
          type: 'rental',
          amount,
          date: admin.firestore.Timestamp.fromDate(randomDateInMonth(year, month)),
        });
        totalPayments++;
      }

      // Generate expenses for each category
      for (const [category, range] of Object.entries(EXPENSE_CATEGORIES)) {
        // Generate 1-3 expenses per category per month
        const expenseCount = randomBetween(1, 3);
        for (let j = 0; j < expenseCount; j++) {
          const amount = randomBetween(range.min, range.max);
          await db.collection('expenses').add({
            category,
            amount,
            date: admin.firestore.Timestamp.fromDate(randomDateInMonth(year, month)),
          });
          totalExpenses++;
        }
      }

      console.log(`Completed data generation for ${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`);
    }

    console.log('\nSeeding completed!');
    console.log(`Added ${totalPayments} payments`);
    console.log(`Added ${totalExpenses} expenses`);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Run the seeding
seedFinancialData(); 