import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, MapPin, Camera,
  Calendar, User, MessageSquare, RotateCcw, Loader2, Tag, AlertTriangle,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import LocationMap from '@/components/geolocation/LocationMap';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LOG_STATUS_COLORS, LOG_STATUS_LABELS, ROLES } from '@/lib/constants';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useState } from 'react';
import api from '@/lib/api';

export default function LogDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, isLoading, mutate } = useApi(id ? `/logs/${id}` : null);
  const log = data?.log || data?.data?.log;
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const handleApprove = async () => {
    setActionLoading('approve');
    try {
      await api.patch(`/logs/${id}/approve`, { comment });
      toast.success('Log approved. Student has been notified.');
      mutate();
      setComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve log.');
    } finally { setActionLoading(''); }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) { toast.error('Please provide a rejection reason.'); return; }
    setActionLoading('reject');
    try {
      await api.patch(`/logs/${id}/reject`, { rejectionReason });
      toast.success('Log rejected. Student has been notified.');
      mutate();
      setRejectionReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject log.');
    } finally { setActionLoading(''); }
  };

  if (isLoading) return (
    <AppLayout pageTitle="Log Detail" allowedRoles={Object.values(ROLES)}>
      <LoadingSpinner />
    </AppLayout>
  );

  if (!log) return (
    <AppLayout pageTitle="Log Detail" allowedRoles={Object.values(ROLES)}>
      <div className="text-center py-16">
        <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">Log not found.</p>
      </div>
    </AppLayout>
  );

  // Determine if the current user can see images
  // Students see their own images, supervisors see assigned logs' images,
  // coordinators and admins always see images
  const canSeeImages = ['supervisor', 'coordinator', 'admin'].includes(user?.role) ||
    (user?.role === 'student' && log.student?._id === user?._id);

  return (
    <>
      <Head><title>UniIlorin E-SIWES — {log.title}</title></Head>
      <AppLayout pageTitle="Log Detail" allowedRoles={Object.values(ROLES)}>
        <div className="max-w-2xl mx-auto space-y-4">
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-unilorin-primary dark:hover:text-blue-400 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Log header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 mb-1">Day {log.dayNumber}</p>
                <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">{log.title}</h2>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${LOG_STATUS_COLORS[log.status]}`}>
                {LOG_STATUS_LABELS[log.status]}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />{formatDate(log.dateOfActivity)}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {log.student?.firstName} {log.student?.lastName}
                {log.student?.matricNumber && ` (${log.student.matricNumber})`}
              </span>
              {log.application?.organizationName && (
                <span className="flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />{log.application.organizationName}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-3">Activity Description</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{log.description}</p>

            {log.skillsLearned?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Skills Learned</p>
                <div className="flex flex-wrap gap-2">
                  {log.skillsLearned.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 bg-unilorin-accent dark:bg-blue-900/30 text-unilorin-primary dark:text-blue-400 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {log.challenges && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">Challenges Faced</p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">{log.challenges}</p>
              </div>
            )}
          </div>

          {/* Captured Images — shown to supervisor, coordinator, admin, and the student themselves */}
          {canSeeImages && (log.portraitImage?.data || log.environmentImage?.data) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Camera className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
                Captured Images
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {log.portraitImage?.data && (
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5 font-medium">Portrait Headshot</p>
                    <img
                      src={log.portraitImage.data}
                      alt="Student portrait headshot"
                      className="w-full rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                      style={{ maxHeight: 280 }}
                    />
                    {log.portraitImage.capturedAt && (
                      <p className="text-xs text-gray-400 mt-1.5">
                        {formatDateTime(log.portraitImage.capturedAt)}
                      </p>
                    )}
                  </div>
                )}
                {log.environmentImage?.data && (
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5 font-medium">Training Environment</p>
                    <img
                      src={log.environmentImage.data}
                      alt="Training environment"
                      className="w-full rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                      style={{ maxHeight: 280 }}
                    />
                    {log.environmentImage.capturedAt && (
                      <p className="text-xs text-gray-400 mt-1.5">
                        {formatDateTime(log.environmentImage.capturedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
              Location at Submission
            </h3>
            <LocationMap
              coordinates={log.geolocation?.coordinates}
              accuracy={log.geolocation?.accuracy}
            />
          </div>

          {/* Supervisor review panel */}
          {user?.role === ROLES.SUPERVISOR && ['pending', 'resubmitted'].includes(log.status) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
              <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
                Review This Log
              </h3>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Optional comment for student
                </label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2}
                  placeholder="Leave feedback for the student (optional)..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 resize-none" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleApprove} disabled={!!actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
                  {actionLoading === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Approve Log
                </button>
                <button onClick={handleReject} disabled={!!actionLoading || !rejectionReason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
                  {actionLoading === 'reject' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Reject Log
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-red-600 dark:text-red-400 mb-1.5">
                  Rejection reason — required to reject
                </label>
                <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={2}
                  placeholder="Explain why this log is being rejected (required)..."
                  className="w-full px-3 py-2 border border-red-200 dark:border-red-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
              </div>
            </div>
          )}

          {/* Approval info */}
          {log.status === 'approved' && (
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-400">
                  Approved by {log.supervisor?.firstName} {log.supervisor?.lastName}
                </p>
                {log.supervisorComment && (
                  <p className="text-xs text-green-700 dark:text-green-500 mt-0.5">{log.supervisorComment}</p>
                )}
                {log.approvedAt && (
                  <p className="text-xs text-green-600/70 dark:text-green-600 mt-1">{formatDateTime(log.approvedAt)}</p>
                )}
              </div>
            </div>
          )}

          {log.status === 'rejected' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-400">Rejected</p>
                  <p className="text-xs text-red-700 dark:text-red-500 mt-0.5">{log.rejectionReason}</p>
                </div>
              </div>
              {user?.role === ROLES.STUDENT && (
                <Link href={`/logs/${id}/edit`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
                  <RotateCcw className="h-4 w-4" />
                  Edit and Resubmit
                </Link>
              )}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}