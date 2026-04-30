import Head from 'next/head';
import Link from 'next/link';
import { ClipboardCheck, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { ROLES, LOG_STATUS_COLORS, LOG_STATUS_LABELS } from '@/lib/constants';
import { formatDate, formatRelativeTime } from '@/lib/utils';

export default function ApprovalsPage() {
  const { data, isLoading } = useApi('/logs/pending');
  const logs = data?.data?.logs || [];

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Approval Queue</title></Head>
      <AppLayout pageTitle="Log Approval Queue" allowedRoles={[ROLES.SUPERVISOR]}>
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Summary bar */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${
            logs.length > 0
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
          }`}>
            {logs.length > 0
              ? <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              : <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />}
            <p className={`text-sm font-medium ${
              logs.length > 0
                ? 'text-yellow-800 dark:text-yellow-300'
                : 'text-green-800 dark:text-green-300'
            }`}>
              {logs.length > 0
                ? `${logs.length} log${logs.length !== 1 ? 's' : ''} awaiting your review`
                : 'All caught up — no pending logs!'}
            </p>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : logs.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="Queue is empty"
              description="No logs are waiting for your review right now. Check back later."
            />
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <Link
                  key={log._id}
                  href={`/logs/${log._id}`}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-unilorin-primary dark:hover:border-blue-500 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5 truncate">
                      {log.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {log.student?.firstName} {log.student?.lastName}
                      {log.student?.matricNumber && ` (${log.student.matricNumber})`}
                      {' · '}Day {log.dayNumber}
                      {' · '}{formatDate(log.dateOfActivity)}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LOG_STATUS_COLORS[log.status]}`}>
                        {LOG_STATUS_LABELS[log.status]}
                      </span>
                      <span className="text-xs text-gray-400">{formatRelativeTime(log.createdAt)}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-unilorin-primary dark:group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}