import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
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

      // Check if the current route needs authentication
      const isProtectedRoute = protectedRoutes.some(route => 
        req.nextUrl.pathname.startsWith(route)
      );

      // Allow access to non-protected routes without authentication
      if (!isProtectedRoute) return true;

      // Require authentication for protected routes
      return !!token;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/teacher/:path*',
    '/student/:path*',
    '/booking/:path*',
    '/studio-rental/:path*',
    '/api/protected/:path*',
  ],
}; 