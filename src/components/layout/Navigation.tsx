'use client';

import { useAuth } from '@/hooks/useAuth';
import { useAuthorization } from '@/hooks/useAuthorization';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const { can } = useAuthorization();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      show: true,
    },
    {
      label: 'User Management',
      href: '/admin/users',
      show: can('manage_users'),
    },
    {
      label: 'Financial Overview',
      href: '/admin/finance',
      show: can('view_financial_data'),
    },
    {
      label: 'Class Management',
      href: '/teacher/classes',
      show: can('manage_classes'),
    },
    {
      label: 'My Classes',
      href: '/classes',
      show: can('book_classes'),
    },
  ].filter(item => item.show);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                Dance App
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {menuItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              {user?.image && (
                <Image
                  src={user.image}
                  alt={user.name || 'User'}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <span className="text-sm text-gray-700">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={() => signOut()}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 