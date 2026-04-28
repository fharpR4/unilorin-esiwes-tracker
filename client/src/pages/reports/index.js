import { useState } from 'react';
import Head from 'next/head';
import { FileText, Plus, Send, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { ROLES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import EmptyState from '@/components/shared/EmptyState';

const EMPTY_FORM = {
  weekNumber: '', startDate: '', endDate: '',
  summary: '', accomplishments: [''], nextWeekPlan: '',
};

export default function ReportsPage() {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useApi('/reports/mine');
  const reports = data?.reports || [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/reports', {
        ...form,
        weekNumber: parseInt(form.weekNumber),
        accomplishments: form.accomplishments.filter((a) => a.trim()),
      });
      toast.success('Weekly report submitted successfully.');
      mutate();
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally { setSubmitting(false); }
  };

  const handleAccomplishmentChange = (i, val) => {
    setForm((p) => { const a = [...p.accomplishments]; a[i] = val; return { ...p, accomplishments: a }; });
  };

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Weekly Reports</title></Head>
      <AppLayout pageTitle="Weekly Reports" allowedRoles={[ROLES.STUDENT]}>
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex justify-end">
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" />
              Submit Weekly Report
            </button>
          </div>

          {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-heading font-bold text-gray-900 dark:text-white">New Weekly Report</h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Week Number *</label>
                    <input type="number" min="1" max="52" value={form.weekNumber} onChange={(e) => setForm((p) => ({ ...p, weekNumber: e.target.value }))} required
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Start Date *</label>
                    <input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} required
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">End Date *</label>
                    <input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} required
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Weekly Summary * <span className={`ml-1 ${form.summary.length >= 100 ? 'text-green-500' : 'text-gray-400'}`}>({form.summary.length}/100 min)</span>
                  </label>
                  <textarea value={form.summary} onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))} required rows={5}
                    placeholder="Summarize everything you did this week in detail..."
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Key Accomplishments</label>
                  {form.accomplishments.map((a, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input type="text" value={a} onChange={(e) => handleAccomplishmentChange(i, e.target.value)} placeholder={`Accomplishment ${i + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500" />
                    </div>
                  ))}
                  <button type="button" onClick={() => setForm((p) => ({ ...p, accomplishments: [...p.accomplishments, ''] }))}
                    className="text-xs text-unilorin-primary dark:text-blue-400 hover:underline flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Plan for Next Week</label>
                  <textarea value={form.nextWeekPlan} onChange={(e) => setForm((p) => ({ ...p, nextWeekPlan: e.target.value }))} rows={2}
                    placeholder="What do you plan to accomplish next week?"
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 resize-none" />
                </div>

                <button type="submit" disabled={submitting || form.summary.length < 100}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            </div>
          )}

          {isLoading ? null : reports.length === 0 && !showForm ? (
            <EmptyState icon={FileText} title="No reports yet" description="Submit your first weekly report." />
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button onClick={() => setExpanded(expanded === report._id ? null : report._id)}
                    className="w-full flex items-center justify-between p-4 text-left">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Week {report.weekNumber} Report</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(report.startDate)} — {formatDate(report.endDate)} · {report.daysAttended} days attended</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${report.status === 'reviewed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                        {report.status}
                      </span>
                      {expanded === report._id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </div>
                  </button>
                  {expanded === report._id && (
                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{report.summary}</p>
                      {report.supervisorFeedback && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Supervisor Feedback</p>
                          <p className="text-sm text-blue-800 dark:text-blue-300">{report.supervisorFeedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}