import { Bell, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { ROLE_LABELS } from '@/lib/constants';

const Header = ({ onMenuClick, pageTitle = '' }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        {pageTitle && (
          <h1 className="text-base font-heading font-semibold text-gray-800 dark:text-gray-200">
            {pageTitle}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle showLabel={false} />
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-unilorin-primary dark:bg-blue-700 flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
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