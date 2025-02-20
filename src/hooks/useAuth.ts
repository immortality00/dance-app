import { useSession, signIn, signOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
    signIn: (provider?: string) => signIn(provider),
    signOut: () => signOut(),
  };
} 