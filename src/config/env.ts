import { z } from 'zod';

const NodeEnv = z.enum(['development', 'staging', 'production']);
type NodeEnv = z.infer<typeof NodeEnv>;

const envSchema = z.object({
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: NodeEnv,

  // Firebase (Required)
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'Firebase API Key is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase Auth Domain is required'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase Project ID is required'),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1, 'Firebase Admin Private Key is required'),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email('Firebase Admin Client Email must be a valid email'),

  // Firebase (Optional)
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),

  // Authentication Providers (Required for auth)
  NEXTAUTH_URL: z.string().url('NextAuth URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth Secret must be at least 32 characters long'),

  // OAuth Providers (Required if using respective providers)
  GOOGLE_CLIENT_ID: z.string().min(1, 'Google Client ID is required when using Google auth'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'Google Client Secret is required when using Google auth'),
  FACEBOOK_CLIENT_ID: z.string().min(1, 'Facebook Client ID is required when using Facebook auth'),
  FACEBOOK_CLIENT_SECRET: z.string().min(1, 'Facebook Client Secret is required when using Facebook auth'),
  APPLE_CLIENT_ID: z.string().min(1, 'Apple Client ID is required when using Apple auth'),
  APPLE_CLIENT_SECRET: z.string().min(1, 'Apple Client Secret is required when using Apple auth'),

  // Payment Processing (Optional until payment features are used)
  STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),

  // PayPal (Optional)
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_WEBHOOK_ID: z.string().optional(),

  // Communications (Required for email features)
  SENDGRID_API_KEY: z.string().startsWith('SG.', 'SendGrid API Key must start with "SG."'),
  SENDGRID_FROM_EMAIL: z.string().email('SendGrid From Email must be a valid email'),

  // Communications (Optional)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // AI/ML (Optional)
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  OPENAI_ORGANIZATION_ID: z.string().optional(),

  // Analytics (Optional)
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().startsWith('G-').optional(),
  BIGQUERY_PROJECT_ID: z.string().optional(),
  BIGQUERY_DATASET_ID: z.string().optional(),
  BIGQUERY_PRIVATE_KEY: z.string().optional(),
  BIGQUERY_CLIENT_EMAIL: z.string().email().optional(),

  // Security (Required)
  JWT_SECRET: z.string().min(32, 'JWT Secret must be at least 32 characters long'),
  ENCRYPTION_KEY: z.string().min(32, 'Encryption Key must be at least 32 characters long'),

  // Database (Required)
  DATABASE_URL: z.string().url('Database URL must be a valid URL'),

  // Redis (Optional)
  REDIS_URL: z.string().url().optional(),

  // Firebase App Check (Required for production)
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().min(1, 'reCAPTCHA Site Key is required for production'),
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
    recaptchaSiteKey: env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  },
  auth: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
    },
    apple: {
      clientId: env.APPLE_CLIENT_ID,
      clientSecret: env.APPLE_CLIENT_SECRET,
    },
    nextAuth: {
      url: env.NEXTAUTH_URL,
      secret: env.NEXTAUTH_SECRET,
    },
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