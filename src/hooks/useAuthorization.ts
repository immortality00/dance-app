import { useAuth } from './useAuth';
import type { UserRole } from '@/types/next-auth';

export function useAuthorization() {
  const { user } = useAuth();

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const isAdmin = () => hasRole('admin');
  const isTeacher = () => hasRole('teacher');
  const isStudent = () => hasRole('student');

  const can = (action: string) => {
    if (!user) return false;

    switch (action) {
      case 'view_financial_data':
        return isAdmin();
      case 'manage_classes':
        return hasRole(['admin', 'teacher']);
      case 'book_classes':
        return hasRole(['student', 'teacher']);
      case 'manage_users':
        return isAdmin();
      default:
        return false;
    }
  };

  return {
    hasRole,
    isAdmin,
    isTeacher,
    isStudent,
    can,
  };
} 