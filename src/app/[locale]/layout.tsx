import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { locales, type Locale } from '@/config/i18n';
import { Inter } from "next/font/google";
import { Providers } from "../providers";
import MainLayout from '@/components/layout/MainLayout';
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Dance Studio Management",
  description: "Manage your dance classes, students, and instructors",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const headersList = await headers();
  const nextIntlLocale = headersList.get('x-next-intl-locale');
  const locale = nextIntlLocale || props.params.locale;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  unstable_setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>
        <MainLayout>{props.children}</MainLayout>
      </Providers>
    </NextIntlClientProvider>
  );
} 