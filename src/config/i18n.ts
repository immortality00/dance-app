export const locales = ['en', 'es'] as const;
export const defaultLocale = 'en' as const;

export type Locale = typeof locales[number];

// Get the preferred locale from the user's profile or browser
export function getPreferredLocale(userLocale?: string): Locale {
  // If user has a preferred locale in their profile, use that
  if (userLocale && locales.includes(userLocale as Locale)) {
    return userLocale as Locale;
  }

  // Otherwise, try to get the browser's language
  if (typeof navigator !== 'undefined') {
    const browserLocale = navigator.language.split('-')[0];
    if (locales.includes(browserLocale as Locale)) {
      return browserLocale as Locale;
    }
  }

  // Fall back to default locale
  return defaultLocale;
} 