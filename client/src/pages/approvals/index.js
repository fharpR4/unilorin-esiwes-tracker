import Head from 'next/head';
import Link from 'next/link';
import { ClipboardCheck, Clock, ChevronRight, CheckCircle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { ROLES, LOG_STATUS_COLORS, LOG_STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function ApprovalsPage() {
  const { data, isLoading } = useApi('/logs/pending');
  const logs = data?.logs || [];

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Approval Queue</title></Head>
      <AppLayout pageTitle="Approval Queue" allowedRoles={[ROLES.SUPERVISOR]}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              {logs.length} log{logs.length !== 1 ? 's' : ''} awaiting your review
            </p>
          </div>

          {isLoading ? <LoadingSpinner /> : logs.length === 0 ? (
            <EmptyState icon={CheckCircle} title="All caught up!" description="No logs are waiting for your review." />
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <Link key={log._id} href={`/logs/${log._id}`}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-unilorin-primary dark:hover:border-blue-500 transition-colors group">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5">{log.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {log.student?.firstName} {log.student?.lastName} · Day {log.dayNumber} · {formatDate(log.dateOfActivity)}
                    </p>
                    <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${LOG_STATUS_COLORS[log.status]}`}>
                      {LOG_STATUS_LABELS[log.status]}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-unilorin-primary dark:group-hover:text-blue-400 flex-shrink-0 ml-3 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}