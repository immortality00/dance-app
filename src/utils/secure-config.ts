import { z } from 'zod';

// Schema for public environment variables (accessible on client-side)
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
});

// Schema for private environment variables (server-side only)
const privateEnvSchema = z.object({
  // Firebase Admin SDK
  FIREBASE_ADMIN_PRIVATE_KEY: z.string(),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email(),
  
  // Authentication
  NEXTAUTH_URL: z.string().url().optional().default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  
  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),
  
  // Payment Processing
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Email
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  
  // Security
  JWT_SECRET: z.string().min(32).optional(),
  ENCRYPTION_KEY: z.string().min(32).optional(),
}).partial();

// Combined schema type
export type PublicConfig = z.infer<typeof publicEnvSchema>;
export type PrivateConfig = z.infer<typeof privateEnvSchema>;

// Validate and get public configuration (safe for client-side)
export function getPublicConfig(): PublicConfig {
  try {
    return publicEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map(err => err.path.join('.'))
        .join(', ');
      throw new Error(`Missing or invalid public environment variables: ${missingVars}`);
    }
    throw error;
  }
}

// Validate and get private configuration (server-side only)
export function getPrivateConfig(): PrivateConfig {
  // Ensure this is only called on the server
  if (typeof window !== 'undefined') {
    throw new Error('getPrivateConfig can only be called on the server side');
  }

  try {
    return privateEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map(err => err.path.join('.'))
        .join(', ');
      throw new Error(`Missing or invalid private environment variables: ${missingVars}`);
    }
    throw error;
  }
}

// Helper to check if code is running on server side
export function isServer(): boolean {
  return typeof window === 'undefined';
}

// Helper to mask sensitive data in logs
export function maskSensitiveData(data: Record<string, any>): Record<string, any> {
  const sensitiveKeys = [
    'password',
    'token',
    'key',
    'secret',
    'credential',
    'private',
    'apiKey',
  ];

  return Object.entries(data).reduce((acc, [key, value]) => {
    if (typeof value === 'object' && value !== null) {
      acc[key] = maskSensitiveData(value);
    } else if (
      sensitiveKeys.some(sensitiveKey => 
        key.toLowerCase().includes(sensitiveKey.toLowerCase())
      )
    ) {
      acc[key] = '********';
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
} 