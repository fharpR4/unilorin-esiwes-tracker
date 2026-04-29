import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, Plus, Filter, ChevronRight } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { ROLES, LOG_STATUS_COLORS, LOG_STATUS_LABELS } from '@/lib/constants';
import { formatDateShort, formatRelativeTime, truncate } from '@/lib/utils';

export default function LogsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useApi(`/logs${statusFilter ? `?status=${statusFilter}` : ''}`);

  // API returns { success, data: { logs }, count, page, pages }
  const logs = data?.data?.logs || [];
  const statuses = ['', 'pending', 'approved', 'rejected', 'resubmitted'];

  return (
    <>
      <Head><title>UniIlorin E-SIWES — My Logs</title></Head>
      <AppLayout pageTitle="My Logs" allowedRoles={[ROLES.STUDENT]}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div className="flex gap-2 flex-wrap flex-1">
              {statuses.map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    statusFilter === s
                      ? 'bg-unilorin-primary dark:bg-blue-600 text-white border-transparent'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-unilorin-primary dark:hover:border-blue-500'
                  }`}>
                  {s ? LOG_STATUS_LABELS[s] : 'All'}
                </button>
              ))}
            </div>
            <Link href="/logs/new"
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-unilorin-primary dark:bg-blue-600 text-white rounded-full text-xs font-medium hover:opacity-90 transition-opacity">
              <Plus className="h-3.5 w-3.5" />New Log
            </Link>
          </div>

          {isLoading ? <LoadingSpinner /> : logs.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No logs found"
              description={statusFilter ? `No logs with status "${LOG_STATUS_LABELS[statusFilter]}"` : "You haven't submitted any logs yet."}
              action={
                <Link href="/logs/new"
                  className="px-4 py-2 bg-unilorin-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                  Submit First Log
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <Link key={log._id} href={`/logs/${log._id}`}
                  className="block p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-unilorin-primary dark:hover:border-blue-500 transition-colors group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-gray-400">Day {log.dayNumber}</span>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <span className="text-xs text-gray-400">{formatDateShort(log.dateOfActivity)}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{log.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{truncate(log.description, 100)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LOG_STATUS_COLORS[log.status]}`}>
                          {LOG_STATUS_LABELS[log.status]}
                        </span>
                        <span className="text-xs text-gray-400">{formatRelativeTime(log.createdAt)}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-unilorin-primary dark:group-hover:text-blue-400 flex-shrink-0 mt-1 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}