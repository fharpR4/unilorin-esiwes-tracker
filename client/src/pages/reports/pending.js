import Head from 'next/head';
import { useState } from 'react';
import {
  FileText, ChevronDown, ChevronUp, Send, Loader2,
  Calendar, Hash, CheckCircle,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { ROLES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function PendingReportsPage() {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useApi('/reports/pending');
  const reports = data?.data?.reports || [];
  const [expanded, setExpanded] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const handleReview = async (reportId) => {
    setActionLoading(reportId);
    try {
      await api.patch(`/reports/${reportId}/review`, { feedback });
      toast.success('Report reviewed. Student has been notified.');
      mutate();
      setExpanded(null);
      setFeedback('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review report.');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Weekly Reports Queue</title></Head>
      <AppLayout pageTitle="Weekly Reports Queue" allowedRoles={[ROLES.SUPERVISOR]}>
        <div className="space-y-4 max-w-2xl mx-auto">
          {reports.length > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
              <p className="text-sm text-yellow-800 dark:text-yellow-400 font-medium">
                {reports.length} report{reports.length !== 1 ? 's' : ''} awaiting your review
              </p>
            </div>
          )}

          {isLoading ? (
            <LoadingSpinner />
          ) : reports.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No pending reports"
              description="All weekly reports have been reviewed."
            />
          ) : (
            reports.map((report) => (
              <div key={report._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => {
                    setExpanded(expanded === report._id ? null : report._id);
                    setFeedback('');
                  }}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5">
                      {report.student?.firstName} {report.student?.lastName} — Week {report.weekNumber}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {report.student?.matricNumber && (
                        <span className="flex items-center gap-1 font-mono">
                          <Hash className="h-3 w-3" />{report.student.matricNumber}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(report.startDate)} — {formatDate(report.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{report.daysAttended} days attended</span>
                      <span>·</span>
                      <span>{report.logsCount} logs submitted</span>
                    </div>
                  </div>
                  {expanded === report._id
                    ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0 ml-3" />
                    : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 ml-3" />}
                </button>

                {expanded === report._id && (
                  <div className="px-4 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Weekly Summary</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{report.summary}</p>
                    </div>

                    {report.accomplishments?.filter((a) => a).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Key Accomplishments</p>
                        <ul className="space-y-1">
                          {report.accomplishments.filter((a) => a).map((acc, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              {acc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {report.nextWeekPlan && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Next Week Plan</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{report.nextWeekPlan}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        Feedback for student (optional)
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={2}
                        placeholder="Leave feedback for the student..."
                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <button
                      onClick={() => handleReview(report._id)}
                      disabled={!!actionLoading}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {actionLoading === report._id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Send className="h-4 w-4" />}
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