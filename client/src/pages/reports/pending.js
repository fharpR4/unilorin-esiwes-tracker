import Head from 'next/head';
import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Send, Loader2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { ROLES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import EmptyState from '@/components/shared/EmptyState';

export default function PendingReportsPage() {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useApi('/reports/pending');
  const reports = data?.reports || [];
  const [expanded, setExpanded] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const handleReview = async (reportId) => {
    setActionLoading(reportId);
    try {
      await api.patch(`/reports/${reportId}/review`, { feedback });
      toast.success('Report reviewed successfully.');
      mutate();
      setExpanded(null);
      setFeedback('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setActionLoading(''); }
  };

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Weekly Reports</title></Head>
      <AppLayout pageTitle="Weekly Reports Queue" allowedRoles={[ROLES.SUPERVISOR]}>
        <div className="space-y-3 max-w-2xl mx-auto">
          {isLoading ? null : reports.length === 0 ? (
            <EmptyState icon={FileText} title="No pending reports" description="All weekly reports have been reviewed." />
          ) : (
            reports.map((report) => (
              <div key={report._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button onClick={() => setExpanded(expanded === report._id ? null : report._id)}
                  className="w-full flex items-center justify-between p-4 text-left">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {report.student?.firstName} {report.student?.lastName} — Week {report.weekNumber}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(report.startDate)} — {formatDate(report.endDate)}</p>
                  </div>
                  {expanded === report._id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>
                {expanded === report._id && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{report.summary}</p>
                    {report.nextWeekPlan && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Next Week Plan</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{report.nextWeekPlan}</p>
                      </div>
                    )}
                    <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={2}
                      placeholder="Leave feedback for student (optional)..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none" />
                    <button onClick={() => handleReview(report._id)} disabled={!!actionLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-unilorin-primary dark:bg-blue-600 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                      {actionLoading === report._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Mark as Reviewed
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </AppLayout>
    </>
  );
}