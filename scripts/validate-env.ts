import { z } from 'zod';
import { config } from 'dotenv';
import { resolve } from 'path';
import { getPublicConfig, getPrivateConfig } from '@/utils/secure-config';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function validateEnvironment() {
  console.log('🔍 Validating environment variables...\n');

  try {
    // Validate public config
    console.log('Checking public environment variables...');
    const publicConfig = getPublicConfig();
    console.log('✅ Public environment variables are valid\n');

    // Validate private config (only in production)
    if (process.env.NODE_ENV === 'production') {
      console.log('Checking private environment variables...');
      const privateConfig = getPrivateConfig();
      console.log('✅ Private environment variables are valid\n');
    }

    // Additional validation for Firebase Admin credentials
    if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      // Check if private key is properly formatted (contains newlines)
      if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----')) {
        throw new Error('FIREBASE_ADMIN_PRIVATE_KEY is not properly formatted. Ensure it contains proper newlines and BEGIN/END markers');
      }
      console.log('✅ Firebase Admin credentials are properly formatted\n');
    }

    // Validate SendGrid configuration
    if (process.env.SENDGRID_API_KEY) {
      if (!process.env.SENDGRID_API_KEY.startsWith('SG.')) {
        throw new Error('SENDGRID_API_KEY should start with "SG."');
      }
      console.log('✅ SendGrid configuration is valid\n');
    }

    // Log environment status
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 App URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
    console.log('\n✨ All environment variables are valid!');

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('\n❌ Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`- ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('\n❌ Validation error:', error instanceof Error ? error.message : error);
    }
    process.exit(1);
  }
}

validateEnvironment().catch(error => {
  console.error('Unexpected error during validation:', error);
  process.exit(1);
}); 