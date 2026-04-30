import Head from 'next/head';
import { useState } from 'react';
import {
  FileCheck, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp,
  Loader2, User, Building2, Calendar, Hash,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { ROLES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const STATUS_COLORS = {
  pending: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-400',
  approved: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-400',
  rejected: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-400',
};

export default function ManageApplicationsPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('pending');
  const { data, isLoading, mutate } = useApi(`/applications?status=${statusFilter}`);
  const applications = data?.data?.applications || [];
  const total = data?.count || 0;

  const [expanded, setExpanded] = useState(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const handleApprove = async (appId) => {
    setActionLoading(`approve-${appId}`);
    try {
      await api.patch(`/applications/${appId}/approve`, { comment });
      toast.success('Application approved. Student has been notified.');
      mutate();
      setExpanded(null);
      setComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve application.');
    } finally { setActionLoading(''); }
  };

  const handleReject = async (appId) => {
    if (!comment.trim()) { toast.error('Please provide a rejection reason.'); return; }
    setActionLoading(`reject-${appId}`);
    try {
      await api.patch(`/applications/${appId}/reject`, { reason: comment });
      toast.success('Application rejected. Student has been notified.');
      mutate();
      setExpanded(null);
      setComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject application.');
    } finally { setActionLoading(''); }
  };

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Manage Applications</title></Head>
      <AppLayout pageTitle="Student Applications" allowedRoles={[ROLES.COORDINATOR, ROLES.ADMIN]}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* Status filter */}
          <div className="flex gap-2 flex-wrap">
            {['pending', 'approved', 'rejected'].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all capitalize ${
                  statusFilter === s
                    ? 'bg-unilorin-primary dark:bg-blue-600 text-white border-transparent'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-unilorin-primary'
                }`}>
                {s} {statusFilter === s && total > 0 && `(${total})`}
              </button>
            ))}
          </div>

          {isLoading ? <LoadingSpinner /> : applications.length === 0 ? (
            <EmptyState icon={FileCheck} title={`No ${statusFilter} applications`}
              description={`No applications with status "${statusFilter}" found.`} />
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button onClick={() => { setExpanded(expanded === app._id ? null : app._id); setComment(''); }}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {app.organizationName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {app.student?.firstName} {app.student?.lastName}
                          {app.student?.matricNumber && ` (${app.student.matricNumber})`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(app.startDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border capitalize ${STATUS_COLORS[app.status]}`}>
                        {app.status}
                      </span>
                      {expanded === app._id
                        ? <ChevronUp className="h-4 w-4 text-gray-400" />
                        : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </div>
                  </button>

                  {expanded === app._id && (
                    <div className="px-4 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
                      {/* Student info */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Student</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {app.student?.firstName} {app.student?.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{app.student?.email}</p>
                          {app.student?.department && <p className="text-xs text-gray-400">{app.student.department}</p>}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Supervisor</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {app.supervisor?.firstName} {app.supervisor?.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{app.supervisor?.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Training Period</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {formatDate(app.startDate)} — {formatDate(app.expectedEndDate)}
                          </p>
                          <p className="text-xs text-gray-400">{app.totalDaysRequired} days required</p>
                        </div>
                        {app.organizationAddress?.city && (
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Location</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {app.organizationAddress.city}, {app.organizationAddress.state}
                            </p>
                          </div>
                        )}
                      </div>

                      {app.coordinatorComment && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Coordinator Note</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{app.coordinatorComment}</p>
                        </div>
                      )}

                      {/* Actions — only for pending */}
                      {app.status === 'pending' && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                              Comment (optional for approval, required for rejection)
                            </label>
                            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2}
                              placeholder="Add a note for the student..."
                              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 resize-none" />
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => handleApprove(app._id)} disabled={!!actionLoading}
                              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
                              {actionLoading === `approve-${app._id}`
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <CheckCircle className="h-4 w-4" />}
                              Approve Application
                            </button>
                            <button onClick={() => handleReject(app._id)} disabled={!!actionLoading || !comment.trim()}
                              className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
                              {actionLoading === `reject-${app._id}`
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <XCircle className="h-4 w-4" />}
                              Reject
                            </button>
                          </div>
                        </>
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