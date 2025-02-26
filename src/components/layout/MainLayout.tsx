'use client';

import { useAuth } from '@/hooks/useAuth';
import Navigation from './Navigation';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuth();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {user && <Navigation />}
      {children}
    </div>
  );
} 