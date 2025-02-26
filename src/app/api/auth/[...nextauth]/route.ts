import NextAuth, { AuthOptions, LoggerInstance } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import { FieldValue } from 'firebase-admin/firestore';
import { config } from '@/config/env';
import type { UserRole } from '@/types/next-auth';
import type { Adapter } from 'next-auth/adapters';
import { AuthError, AUTH_ERROR_CODES, AuthProfile } from '@/types/auth';
import { initializeFirebaseAdmin } from '@/utils/firebase-admin';
import { logger } from '@/utils/logger';
import { maskSensitiveData } from '@/utils/secure-config';

// Initialize Firebase Admin and get Firestore instance
const { app: firebaseAdmin, db } = initializeFirebaseAdmin();

// Rate limiting map for failed attempts
const failedAttempts = new Map<string, { count: number; timestamp: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempts = failedAttempts.get(identifier);

  // Clear old entries
  if (attempts && now - attempts.timestamp > LOCKOUT_DURATION) {
    failedAttempts.delete(identifier);
    return true;
  }

  if (attempts && attempts.count >= MAX_FAILED_ATTEMPTS) {
    return false;
  }

  return true;
}

function recordFailedAttempt(identifier: string) {
  const now = Date.now();
  const attempts = failedAttempts.get(identifier) || { count: 0, timestamp: now };
  
  failedAttempts.set(identifier, {
    count: attempts.count + 1,
    timestamp: now,
  });
}

const authLogger: Partial<LoggerInstance> = {
  error(code, metadata) {
    const error = metadata instanceof Error ? metadata : metadata?.error;
    const context = metadata instanceof Error ? {} : (metadata as Record<string, unknown>);
    logger.error(`Auth Error: ${code}`, maskSensitiveData({
      ...context,
      error: error?.message || 'Unknown error',
    }));
  },
  warn(code, metadata) {
    logger.warn(`Auth Warning: ${code}`, maskSensitiveData(metadata as Record<string, unknown>));
  },
  debug(code, metadata) {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Auth Debug: ${code}`, maskSensitiveData(metadata as Record<string, unknown>));
    }
  },
};

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: config.auth.google.clientId || '',
      clientSecret: config.auth.google.clientSecret || '',
    }),
    FacebookProvider({
      clientId: config.auth.facebook.clientId || '',
      clientSecret: config.auth.facebook.clientSecret || '',
    }),
    AppleProvider({
      clientId: config.auth.apple.clientId || '',
      clientSecret: config.auth.apple.clientSecret || '',
    }),
  ].filter(provider => provider.clientId && provider.clientSecret),

  adapter: FirestoreAdapter(firebaseAdmin) as Adapter,
  
  logger: authLogger,

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/auth/signout',
    verifyRequest: '/auth/verify-request',
  },

  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as UserRole;
        session.user.lastActive = token.lastActive;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        try {
          const userDoc = await db.doc(`users/${user.id}`).get();
          if (!userDoc.exists) {
            throw new AuthError(
              'User document not found',
              AUTH_ERROR_CODES.USER_NOT_FOUND
            );
          }
          
          const userData = userDoc.data();
          token.role = userData?.role || 'student';
          token.lastActive = userData?.lastActive;
        } catch (error) {
          logger.error('Failed to update JWT token', {
            userId: user.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          throw new AuthError(
            'Failed to process authentication token',
            AUTH_ERROR_CODES.DATABASE_ERROR
          );
        }
      }
      return token;
    },

    async signIn({ user, account, profile }) {
      const typedProfile = profile as AuthProfile;
      
      try {
        // Check rate limiting
        const identifier = user.email || user.id;
        if (!checkRateLimit(identifier)) {
          throw new AuthError(
            'Too many failed attempts. Please try again later.',
            AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED
          );
        }

        // Validate email
        if (!user.email) {
          recordFailedAttempt(identifier);
          throw new AuthError(
            'Email is required for authentication',
            AUTH_ERROR_CODES.MISSING_EMAIL
          );
        }

        const userRef = db.doc(`users/${user.id}`);
        
        try {
          const userDoc = await userRef.get();

          if (!userDoc.exists) {
            // Create new user
            await userRef.set({
              email: user.email,
              name: user.name || typedProfile?.name,
              image: user.image,
              role: 'student',
              lastActive: FieldValue.serverTimestamp(),
              createdAt: FieldValue.serverTimestamp(),
              provider: account?.provider,
              providerAccountId: account?.providerAccountId,
              emailVerified: user.emailVerified,
              locale: typedProfile?.locale || 'en',
            });

            logger.info('New user created', {
              userId: user.id,
              provider: account?.provider,
            });
          } else {
            // Check if trying to sign in with different provider
            const userData = userDoc.data();
            if (userData?.provider && 
                userData.provider !== account?.provider && 
                userData.email === user.email) {
              recordFailedAttempt(identifier);
              throw new AuthError(
                `Account exists with ${userData.provider}. Please sign in with that provider.`,
                AUTH_ERROR_CODES.ACCOUNT_EXISTS
              );
            }

            // Update existing user
            await userRef.update({
              lastActive: FieldValue.serverTimestamp(),
              ...(user.name && { name: user.name }),
              ...(user.image && { image: user.image }),
              ...(typedProfile?.locale && { locale: typedProfile.locale }),
              emailVerified: user.emailVerified,
            });

            logger.info('User signed in', {
              userId: user.id,
              provider: account?.provider,
            });
          }
        } catch (dbError) {
          recordFailedAttempt(identifier);
          logger.error('Database operation failed', {
            userId: user.id,
            error: dbError instanceof Error ? dbError.message : 'Unknown error',
          });
          throw new AuthError(
            'Failed to process sign in. Please try again later.',
            AUTH_ERROR_CODES.DATABASE_ERROR
          );
        }

        return true;
      } catch (error) {
        if (error instanceof AuthError) {
          throw error;
        }
        logger.error('Unexpected sign in error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          provider: account?.provider,
        });
        throw new AuthError(
          'An unexpected error occurred during sign in.',
          AUTH_ERROR_CODES.PROVIDER_ERROR
        );
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 