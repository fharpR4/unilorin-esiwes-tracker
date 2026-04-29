import Head from 'next/head';
import { Bell, CheckCheck, Circle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import EmptyState from '@/components/shared/EmptyState';
import { ROLES } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';

const NOTIF_COLORS = {
  log_approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  log_rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  log_resubmitted: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  project_approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  project_rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  report_submitted: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  system: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, mutate } = useApi('/notifications');

  // API returns { success, data: { notifications }, unreadCount }
  const notifications = data?.data?.notifications || [];
  const unread = data?.unreadCount || 0;

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      mutate();
    } catch (err) {
      // Silent — not critical
    }
  };

  const handleMarkAll = async () => {
    try {
      await api.patch('/notifications/read-all');
      toast.success('All notifications marked as read.');
      mutate();
    } catch (err) {
      toast.error('Failed to mark all as read.');
    }
  };

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Notifications</title></Head>
      <AppLayout pageTitle="Notifications" allowedRoles={Object.values(ROLES)}>
        <div className="max-w-2xl mx-auto">
          {unread > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{unread} unread</p>
              <button onClick={handleMarkAll}
                className="flex items-center gap-1.5 text-sm text-unilorin-primary dark:text-blue-400 hover:underline font-medium">
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
            </div>
          )}

          {notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" description="You are all caught up." />
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <button
                  key={notif._id}
                  onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                  className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                    notif.isRead
                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${NOTIF_COLORS[notif.type] || NOTIF_COLORS.system}`}>
                    {notif.isRead
                      ? <Circle className="h-3 w-3 opacity-30" />
                      : <Circle className="h-3 w-3 fill-current" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${notif.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatRelativeTime(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}