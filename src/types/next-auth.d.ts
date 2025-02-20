import 'next-auth';
import 'next-auth/jwt';
import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'teacher' | 'student';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      lastActive?: Timestamp;
    }
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
    lastActive?: Timestamp;
    emailVerified?: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid: string;
    role: UserRole;
    lastActive?: Timestamp;
  }
} 