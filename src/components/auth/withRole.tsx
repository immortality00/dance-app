'use client';

import { useAuthorization } from '@/hooks/useAuthorization';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingScreen from './LoadingScreen';
import { withAuth } from './withAuth';
import type { UserRole } from '@/types/next-auth';

export function withRole(allowedRoles: UserRole | UserRole[]) {
  return function <P extends object>(WrappedComponent: React.ComponentType<P>) {
    function RoleBasedRoute(props: P) {
      const { hasRole } = useAuthorization();
      const router = useRouter();

      useEffect(() => {
        if (!hasRole(allowedRoles)) {
          router.push('/unauthorized');
        }
      }, [router]);

      if (!hasRole(allowedRoles)) {
        return <LoadingScreen />;
      }

      return <WrappedComponent {...props} />;
    }

    return withAuth(RoleBasedRoute);
  };
} 