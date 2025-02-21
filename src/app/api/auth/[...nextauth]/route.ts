import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import { cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { config } from '@/config/env';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import type { UserRole } from '@/types/next-auth';

// Initialize Firebase Admin if not already initialized
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

export const authOptions: AuthOptions = {
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
  adapter: FirestoreAdapter(firebaseAdmin),
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
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        session.user.lastActive = token.lastActive;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role || 'student'; // Default role
        token.lastActive = user.lastActive;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      try {
        if (!user.email) {
          throw new Error('Email is required for authentication');
        }

        // Update or create user document in Firestore
        const userRef = db.doc(`users/${user.id}`);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          // Create new user with default role
          await userRef.set({
            email: user.email,
            name: user.name,
            image: user.image,
            role: 'student',
            lastActive: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
          });
        } else {
          // Update existing user's last active timestamp
          await userRef.update({
            lastActive: FieldValue.serverTimestamp(),
            ...(user.name && { name: user.name }),
            ...(user.image && { image: user.image }),
          });
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
  },
  events: {
    async signIn({ user }) {
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
      try {
        const userRef = db.doc(`users/${user.id}`);
        await userRef.update({
          role: 'student',
          lastActive: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error('Error setting default user role:', error);
      }
    },
    async linkAccount({ user }) {
      try {
        const userRef = db.doc(`users/${user.id}`);
        await userRef.update({
          lastActive: FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error('Error updating user after linking account:', error);
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 