import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
}

export function generateMetadata({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noIndex = false,
}: SEOProps): Metadata {
  const siteTitle = 'Dance Studio App';
  const fullTitle = `${title} | ${siteTitle}`;
  const defaultDescription = 'Manage your dance studio classes, students, and schedules with ease.';
  const defaultImage = '/images/og-image.jpg';

  return {
    title: fullTitle,
    description: description || defaultDescription,
    keywords: keywords,
    openGraph: {
      title: fullTitle,
      description: description || defaultDescription,
      type: ogType,
      images: [{ url: ogImage || defaultImage }],
    },
    twitter: {
      card: twitterCard,
      title: fullTitle,
      description: description || defaultDescription,
      images: [ogImage || defaultImage],
    },
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    manifest: '/site.webmanifest',
  };
} 