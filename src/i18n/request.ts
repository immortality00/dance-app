import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';
import { headers } from 'next/headers';
import { locales, defaultLocale } from '@/config/i18n';

export default getRequestConfig(async () => {
  const headersList = await headers();
  const locale = headersList.get('x-next-intl-locale') || defaultLocale;
  let messages: AbstractIntlMessages;
  
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    messages = (await import('../messages/en.json')).default;
  }

  return {
    locale,
    defaultLocale,
    locales,
    messages,
    timeZone: 'America/Los_Angeles',
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
    }
  };
}); 