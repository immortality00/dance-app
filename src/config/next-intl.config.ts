import { Pathnames } from 'next-intl/navigation';
import { locales, defaultLocale } from './i18n';

export const pathnames = {
  '/': '/',
  '/about': '/about',
  '/contact': '/contact',
  '/pricing': '/pricing',
  '/schedule': '/schedule',
  '/auth/signin': '/auth/signin',
  '/auth/signup': '/auth/signup',
  '/auth/forgot-password': '/auth/forgot-password',
  '/dashboard': '/dashboard',
  '/profile': '/profile',
  '/admin/users': '/admin/users',
  '/admin/finance': '/admin/finance',
  '/admin/analytics': '/admin/analytics',
  '/teacher/classes': '/teacher/classes',
  '/teacher/classes/[id]/attendance': '/teacher/classes/[id]/attendance',
  '/student/progress': '/student/progress',
  '/classes': '/classes',
  '/booking': '/booking',
  '/studio-rental': '/studio-rental',
} satisfies Pathnames<typeof locales>;

export const localePrefix = 'as-needed';

export type AppPathnames = keyof typeof pathnames;

export default {
  defaultLocale,
  locales,
  localePrefix,
  pathnames,
  // Add support for date/time/number formatting
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
        minute: 'numeric'
      }
    },
    number: {
      currency: {
        style: 'currency',
        currency: 'USD'
      },
      percent: {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    }
  }
}; 