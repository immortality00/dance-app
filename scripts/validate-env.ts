import { config } from '../src/config/env';

try {
  console.log('✅ Environment validation passed!');
  console.log(`Current environment: ${config.app.nodeEnv}`);
  console.log(`Application URL: ${config.app.url}`);
} catch (error) {
  console.error(error);
  process.exit(1);
} 