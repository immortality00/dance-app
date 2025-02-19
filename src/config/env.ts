import { z } from 'zod';

const NodeEnv = z.enum(['development', 'staging', 'production']);
type NodeEnv = z.infer<typeof NodeEnv>;

const envSchema = z.object({
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: NodeEnv,

  // Firebase (Required)
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email(),

  // Firebase (Optional)
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),

  // Payment Processing
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),

  // PayPal (Optional)
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_WEBHOOK_ID: z.string().optional(),

  // Communications
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  SENDGRID_API_KEY: z.string().startsWith('SG.'),
  SENDGRID_FROM_EMAIL: z.string().email(),

  // AI/ML
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  OPENAI_ORGANIZATION_ID: z.string().optional(),

  // Analytics
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().startsWith('G-').optional(),
  BIGQUERY_PROJECT_ID: z.string().optional(),
  BIGQUERY_DATASET_ID: z.string().optional(),
  BIGQUERY_PRIVATE_KEY: z.string().optional(),
  BIGQUERY_CLIENT_EMAIL: z.string().email().optional(),

  // Security
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis (Optional)
  REDIS_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => {
        return `${issue.path.join('.')}: ${issue.message}`;
      }).join('\n');
      throw new Error(`❌ Invalid environment variables:\n${issues}`);
    }
    throw error;
  }
}

// Environment helper functions
const env = validateEnv();

export const config = {
  app: {
    url: env.NEXT_PUBLIC_APP_URL,
    nodeEnv: env.NODE_ENV,
    isDev: env.NODE_ENV === 'development',
    isStaging: env.NODE_ENV === 'staging',
    isProd: env.NODE_ENV === 'production',
  },
  firebase: {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
    adminPrivateKey: env.FIREBASE_ADMIN_PRIVATE_KEY,
    adminClientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
  },
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  },
  paypal: {
    clientId: env.PAYPAL_CLIENT_ID,
    clientSecret: env.PAYPAL_CLIENT_SECRET,
    webhookId: env.PAYPAL_WEBHOOK_ID,
  },
  twilio: {
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    phoneNumber: env.TWILIO_PHONE_NUMBER,
  },
  sendgrid: {
    apiKey: env.SENDGRID_API_KEY,
    fromEmail: env.SENDGRID_FROM_EMAIL,
  },
  openai: {
    apiKey: env.OPENAI_API_KEY,
    organizationId: env.OPENAI_ORGANIZATION_ID,
  },
  analytics: {
    googleAnalyticsId: env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    bigquery: {
      projectId: env.BIGQUERY_PROJECT_ID,
      datasetId: env.BIGQUERY_DATASET_ID,
      privateKey: env.BIGQUERY_PRIVATE_KEY,
      clientEmail: env.BIGQUERY_CLIENT_EMAIL,
    },
  },
  security: {
    jwtSecret: env.JWT_SECRET,
    encryptionKey: env.ENCRYPTION_KEY,
  },
  database: {
    url: env.DATABASE_URL,
  },
  redis: {
    url: env.REDIS_URL,
  },
} as const; 