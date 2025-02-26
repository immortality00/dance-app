import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/config/i18n';

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

// List of routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/admin',
  '/teacher',
  '/student',
  '/booking',
  '/studio-rental',
  '/api/protected'
];

// Middleware handler
export default async function middleware(request: NextRequest) {
  const publicPatterns = ['/favicon', '/api/public', '/_next', '/images', '/static'];
  if (publicPatterns.some(pattern => request.nextUrl.pathname.startsWith(pattern))) {
    return NextResponse.next();
  }

  // Handle i18n first
  const response = await intlMiddleware(request);

  // Get the pathname without locale
  const pathname = request.nextUrl.pathname;
  const pathnameWithoutLocale = pathname.replace(new RegExp(`^/(${locales.join('|')})`), '');

  // Check if the path requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathnameWithoutLocale.startsWith(route)
  );

  if (isProtectedRoute) {
    // Get the Firebase auth token from the cookie
    const token = request.cookies.get('firebase-auth-token')?.value;

    if (!token) {
      // Redirect to sign in page with return URL
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return response;
}

// Configure middleware matcher
export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_static (inside /public)
    // - /_vercel (Vercel internals)
    // - /favicon.ico, /sitemap.xml, /robots.txt (static files)
    '/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}; 