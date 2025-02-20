import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import { cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { config } from '@/config/env';

// Initialize Firebase Admin if not already initialized
import { getApp, getApps, initializeApp } from 'firebase-admin/app';

const firebaseAdmin = !getApps().length
  ? initializeApp({
      credential: cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.adminClientEmail,
        privateKey: config.firebase.adminPrivateKey.replace(/\\n/g, '\n'),
      }),
    })
  : getApp();

const db = getFirestore(firebaseAdmin);

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: config.auth.google.clientId,
      clientSecret: config.auth.google.clientSecret,
    }),
    FacebookProvider({
      clientId: config.auth.facebook.clientId,
      clientSecret: config.auth.facebook.clientSecret,
    }),
    AppleProvider({
      clientId: config.auth.apple.clientId,
      clientSecret: config.auth.apple.clientSecret,
    }),
  ],
  adapter: FirestoreAdapter(firebaseAdmin) as any, // Type assertion needed due to version mismatch
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
        // Add user ID and role to the session
        session.user.id = token.sub!;
        session.user.role = token.role as 'admin' | 'teacher' | 'student';
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Add custom claims to the token
        token.uid = user.id;
        token.role = user.role;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      // You can add custom logic here to validate sign-ins
      if (!user.email) {
        return false;
      }
      return true;
    },
  },
  events: {
    async signIn({ user }) {
      // Update last active timestamp in Firestore
      try {
        const userRef = db.doc(`users/${user.id}`);
        await userRef.update({
          lastActive: FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error('Error updating user last active:', error);
      }
    },
    async createUser({ user }) {
      // Set default role for new users
      try {
        const userRef = db.doc(`users/${user.id}`);
        await userRef.update({
          role: 'student', // Default role
          lastActive: FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error('Error setting default user role:', error);
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST }; 