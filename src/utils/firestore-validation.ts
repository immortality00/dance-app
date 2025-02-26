import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';
import { DanceStyle } from '@/types/firebase';

// Custom Zod refinements
const isFirestoreTimestamp = (value: any): value is Timestamp => {
  return value instanceof Timestamp;
};

// Custom Zod schemas
export const timestampSchema = z.custom<Timestamp>(isFirestoreTimestamp, {
  message: 'Expected Firestore Timestamp'
});

// Base schemas for common fields
const baseDocumentSchema = z.object({
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Payment document schema
export const paymentSchema = baseDocumentSchema.extend({
  userId: z.string(),
  classId: z.string(),
  amount: z.number().positive(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  processedAt: timestampSchema,
  paymentMethod: z.string(),
  transactionDetails: z.record(z.unknown()).optional(),
});

// Enrollment document schema
export const enrollmentSchema = baseDocumentSchema.extend({
  userId: z.string(),
  classId: z.string(),
  enrolledAt: timestampSchema,
  paymentId: z.string(),
  amount: z.number().positive(),
  status: z.enum(['active', 'cancelled', 'completed']),
});

// Class document schema
export const classSchema = baseDocumentSchema.extend({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  teacherId: z.string(),
  schedule: z.string(),
  date: timestampSchema,
  duration: z.number().positive(),
  capacity: z.number().positive(),
  enrolled: z.number().min(0),
  enrolledStudents: z.array(z.string()),
  waitlist: z.array(z.string()).optional(),
  price: z.number().positive(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  style: z.nativeEnum(DanceStyle),
  location: z.string(),
  lastUpdated: timestampSchema,
});

// Type inference helpers
export type FirestorePayment = z.infer<typeof paymentSchema>;
export type FirestoreEnrollment = z.infer<typeof enrollmentSchema>;
export type FirestoreClass = z.infer<typeof classSchema>;

// Validation helper functions
export function validateFirestoreData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid Firestore data in ${context}: ${error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`
      );
    }
    throw error;
  }
}

// Partial validation helper for updates
export function validatePartialFirestoreData<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: unknown,
  context: string
): Partial<z.infer<typeof schema>> {
  const partialSchema = schema.deepPartial();
  return validateFirestoreData(partialSchema, data, context);
} 