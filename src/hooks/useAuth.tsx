import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string | null;
  name: string | null;
  image?: string | null;
  role?: 'student' | 'teacher' | 'admin';
  lastActive?: Date;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: Error | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_STATE: AuthState = {
  user: null,
  loading: true,
  initialized: false,
  error: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);
  const router = useRouter();
  const pathname = usePathname();
  const auth = getAuth();

  // List of public routes that don't require authentication
  const publicRoutes = ['/', '/about', '/contact', '/pricing', '/schedule'];

  // Function to fetch user data from Firestore
  const fetchUserData = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data();
      
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: userData?.name || firebaseUser.displayName,
        image: userData?.image,
        role: userData?.role || 'student',
        lastActive: userData?.lastActive?.toDate(),
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }, []);

  // Function to refresh user data
  const refreshUserData = useCallback(async () => {
    if (!state.user?.id) return;

    setState(prev => ({ ...prev, loading: true }));
    try {
      const userDoc = await getDoc(doc(db, 'users', state.user.id));
      const userData = userDoc.data();
      
      setState(prev => ({
        ...prev,
        loading: false,
        user: prev.user ? {
          ...prev.user,
          name: userData?.name || prev.user.name,
          image: userData?.image || prev.user.image,
          role: userData?.role || prev.user.role,
          lastActive: userData?.lastActive?.toDate(),
        } : null,
      }));
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setState(prev => ({ ...prev, loading: false, error: error as Error }));
    }
  }, [state.user?.id]);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setState(prev => ({ ...prev, loading: true }));
          const userData = await fetchUserData(firebaseUser);
          
          // Get the auth token and set it in a cookie
          const token = await firebaseUser.getIdToken();
          Cookies.set('firebase-auth-token', token, { 
            expires: 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
          
          setState({
            user: userData,
            loading: false,
            initialized: true,
            error: null,
          });
        } else {
          // Remove the auth token cookie when signed out
          Cookies.remove('firebase-auth-token');
          
          setState({
            user: null,
            loading: false,
            initialized: true,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setState({
          user: null,
          loading: false,
          initialized: true,
          error: error as Error,
        });
      }
    });

    return () => unsubscribe();
  }, [auth, fetchUserData]);

  // Set up real-time listener for user data updates
  useEffect(() => {
    if (!state.user?.id) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', state.user.id),
      (doc) => {
        const userData = doc.data();
        if (userData) {
          setState(prev => ({
            ...prev,
            user: prev.user ? {
              ...prev.user,
              name: userData.name || prev.user.name,
              image: userData.image || prev.user.image,
              role: userData.role || prev.user.role,
              lastActive: userData.lastActive?.toDate(),
            } : null,
          }));
        }
      },
      (error) => {
        console.error('User data sync error:', error);
        setState(prev => ({ ...prev, error: error as Error }));
      }
    );

    return () => unsubscribe();
  }, [state.user?.id]);

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(result.user);
      setState({
        user: userData,
        loading: false,
        initialized: true,
        error: null,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(result.user);
      setState({
        user: userData,
        loading: false,
        initialized: true,
        error: null,
      });
    } catch (error) {
      console.error('Sign up error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await firebaseSignOut(auth);
      setState({
        user: null,
        loading: false,
        initialized: true,
        error: null,
      });
      
      // Redirect to homepage if current page is protected, otherwise stay on current page
      if (publicRoutes.includes(pathname)) {
        // Stay on the current page if it's a public route
        router.refresh();
      } else {
        // Redirect to homepage if on a protected route
        router.push('/');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {!state.initialized ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 