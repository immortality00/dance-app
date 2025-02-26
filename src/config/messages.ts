import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './i18n';
import { logger } from '@/utils/logger';

export default getRequestConfig(async ({ locale }) => {
  return {
    locale,
    defaultLocale,
    locales,
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        },
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          timeZoneName: 'short'
        }
      },
      number: {
        currency: {
          style: 'currency',
          currency: 'USD'
        },
        percent: {
          style: 'percent',
          minimumFractionDigits: 2
        }
      }
    },
    defaultTranslationValues: {
      appName: 'Dance Management App',
      company: 'Dance Studio',
    },
    onError: (error) => {
      logger.error('Translation error', { error });
    },
    getMessageFallback: ({ key, namespace }) => {
      logger.warn('Missing translation', { key, namespace });
      return key;
    }
  };
}); 