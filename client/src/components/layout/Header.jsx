import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { ROLE_LABELS } from '@/lib/constants';
import useApi from '@/hooks/useApi';
import { getInitials } from '@/lib/utils';

const Header = ({ pageTitle = '' }) => {
  const { user } = useAuth();
  const { data: notifData } = useApi('/notifications?limit=1');
  const unreadCount = notifData?.unreadCount || 0;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Page title — always visible */}
      <div className="flex items-center gap-3 min-w-0">
        {pageTitle && (
          <h1 className="text-base font-heading font-semibold text-gray-800 dark:text-gray-200 truncate">
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ThemeToggle showLabel={false} />

        {/* Notification bell — links to notifications page */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User avatar — hidden on mobile (mobile has its own profile page) */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-unilorin-primary dark:bg-blue-700 flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {getInitials(user?.firstName, user?.lastName)}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">
              {ROLE_LABELS[user?.role]}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;