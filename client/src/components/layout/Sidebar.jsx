import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard, BookOpen, ClipboardCheck, Users, Building2,
  UserCog, LogOut, ChevronRight, GraduationCap, CalendarCheck,
  FolderGit2, FileText, Bell, Settings, BarChart3, ScrollText,
  FileCheck, UserCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { ROLES } from '@/lib/constants';
import useApi from '@/hooks/useApi';

const NAV_ITEMS = {
  [ROLES.STUDENT]: [
    { href: '/dashboard/student', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/applications', icon: FileCheck, label: 'SIWES Application' },
    { href: '/attendance', icon: CalendarCheck, label: 'Attendance' },
    { href: '/logs', icon: BookOpen, label: 'My Logs' },
    { href: '/logs/new', icon: ClipboardCheck, label: 'New Log Entry' },
    { href: '/projects/mine', icon: FolderGit2, label: 'My Project Title' },
    { href: '/reports', icon: FileText, label: 'Weekly Reports' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    { href: '/profile', icon: Settings, label: 'Profile Settings' },
  ],
  [ROLES.SUPERVISOR]: [
    { href: '/dashboard/supervisor', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/supervisor/students', icon: Users, label: 'My Students' },
    { href: '/approvals', icon: ClipboardCheck, label: 'Log Approvals' },
    { href: '/projects/pending', icon: FolderGit2, label: 'Project Approvals' },
    { href: '/reports/pending', icon: FileText, label: 'Weekly Reports' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    { href: '/supervisor/setup', icon: UserCheck, label: 'My Profile Setup' },
    { href: '/profile', icon: Settings, label: 'Account Settings' },
  ],
  [ROLES.COORDINATOR]: [
    { href: '/dashboard/coordinator', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/applications/manage', icon: FileCheck, label: 'Applications' },  // ADD THIS LINE
    { href: '/students', icon: Users, label: 'All Students' },
    { href: '/projects', icon: FolderGit2, label: 'All Projects' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    { href: '/profile', icon: Settings, label: 'Profile Settings' },
  ],
  [ROLES.ADMIN]: [
    { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: UserCog, label: 'Users' },
    { href: '/admin/institutions', icon: Building2, label: 'Institutions' },
    { href: '/admin/activity', icon: ScrollText, label: 'Activity Logs' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    { href: '/profile', icon: Settings, label: 'Profile Settings' },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navItems = NAV_ITEMS[user?.role] || [];
  const { data: notifData } = useApi('/notifications?limit=1');
  const unreadCount = notifData?.unreadCount || 0;

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-unilorin-primary dark:bg-gray-900 text-white fixed left-0 top-0 z-30">
      {/* Brand */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-unilorin-secondary/20 border border-unilorin-secondary/30 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="h-5 w-5 text-unilorin-secondary" />
          </div>
          <div>
            <p className="text-xs font-medium text-white/50 leading-none">University of Ilorin</p>
            <p className="text-sm font-heading font-bold text-white leading-tight mt-0.5">E-SIWES Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = router.pathname === href || router.pathname.startsWith(href + '/');
          const isNotif = href === '/notifications';
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'
              )}>
              <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-unilorin-secondary' : 'text-white/50 group-hover:text-white/80')} />
              <span className="flex-1">{label}</span>
              {isNotif && unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {isActive && <ChevronRight className="h-3.5 w-3.5 text-unilorin-secondary flex-shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-unilorin-secondary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-white/40 capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-white/50 hover:bg-white/8 hover:text-white transition-colors">
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;