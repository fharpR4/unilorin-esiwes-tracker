import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard, BookOpen, ClipboardCheck, Users,
  CalendarCheck, FolderGit2, Bell, Settings, FileCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { ROLES } from '@/lib/constants';
import useApi from '@/hooks/useApi';

const MOBILE_NAV = {
  [ROLES.STUDENT]: [
    { href: '/dashboard/student', icon: LayoutDashboard, label: 'Home' },
    { href: '/applications', icon: FileCheck, label: 'Apply' },
    { href: '/attendance', icon: CalendarCheck, label: 'Attend' },
    { href: '/logs', icon: BookOpen, label: 'Logs' },
    { href: '/profile', icon: Settings, label: 'Profile' },
  ],
  [ROLES.SUPERVISOR]: [
    { href: '/dashboard/supervisor', icon: LayoutDashboard, label: 'Home' },
    { href: '/supervisor/students', icon: Users, label: 'Students' },
    { href: '/approvals', icon: ClipboardCheck, label: 'Approvals' },
    { href: '/notifications', icon: Bell, label: 'Alerts', showBadge: true },
    { href: '/profile', icon: Settings, label: 'Profile' },
  ],
  [ROLES.COORDINATOR]: [
    { href: '/dashboard/coordinator', icon: LayoutDashboard, label: 'Home' },
    { href: '/students', icon: Users, label: 'Students' },
    { href: '/projects', icon: FolderGit2, label: 'Projects' },
    { href: '/notifications', icon: Bell, label: 'Alerts', showBadge: true },
    { href: '/profile', icon: Settings, label: 'Profile' },
  ],
  [ROLES.ADMIN]: [
    { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Home' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/notifications', icon: Bell, label: 'Alerts', showBadge: true },
    { href: '/profile', icon: Settings, label: 'Profile' },
  ],
};

const MobileNav = () => {
  const { user } = useAuth();
  const router = useRouter();
  const items = MOBILE_NAV[user?.role] || [];
  const { data: notifData } = useApi('/notifications?limit=1');
  const unreadCount = notifData?.unreadCount || 0;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-around py-1.5 px-2">
        {items.map(({ href, icon: Icon, label, showBadge }) => {
          const isActive = router.pathname === href || router.pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-0 flex-1 relative">
              <div className="relative">
                <Icon className={cn('h-5 w-5 transition-colors', isActive ? 'text-unilorin-primary dark:text-blue-400' : 'text-gray-400 dark:text-gray-500')} />
                {showBadge && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white flex items-center justify-center" style={{ fontSize: 8 }}>
                    {unreadCount > 9 ? '9' : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn('text-xs font-medium transition-colors truncate w-full text-center', isActive ? 'text-unilorin-primary dark:text-blue-400' : 'text-gray-400 dark:text-gray-500')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;