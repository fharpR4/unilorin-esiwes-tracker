import Head from 'next/head';
import { useState } from 'react';
import {
  FolderGit2, CheckCircle, XCircle, RefreshCw,
  ChevronDown, ChevronUp, Loader2, User, Hash,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { ROLES } from '@/lib/constants';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function PendingProjectsPage() {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useApi('/projects/pending');
  const projects = data?.data?.projects || [];
  const [expanded, setExpanded] = useState(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const handleAction = async (projectId, action) => {
    if (action !== 'approve' && !comment.trim()) {
      toast.error('Please provide a reason before rejecting or requesting revision.');
      return;
    }
    setActionLoading(`${action}-${projectId}`);
    try {
      if (action === 'approve') {
        await api.patch(`/projects/${projectId}/approve`, { comment });
        toast.success('Project title approved. Student has been notified.');
      } else if (action === 'revision') {
        await api.patch(`/projects/${projectId}/reject`, { reason: comment, requestRevision: true });
        toast.success('Revision requested. Student has been notified.');
      } else {
        await api.patch(`/projects/${projectId}/reject`, { reason: comment, requestRevision: false });
        toast.success('Project rejected. Student has been notified.');
      }
      mutate();
      setExpanded(null);
      setComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Project Approvals</title></Head>
      <AppLayout pageTitle="Project Title Approvals" allowedRoles={[ROLES.SUPERVISOR]}>
        <div className="space-y-4 max-w-2xl mx-auto">
          {projects.length > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
              <p className="text-sm text-yellow-800 dark:text-yellow-400 font-medium">
                {projects.length} project title{projects.length !== 1 ? 's' : ''} awaiting your review
              </p>
            </div>
          )}

          {isLoading ? (
            <LoadingSpinner />
          ) : projects.length === 0 ? (
            <EmptyState
              icon={FolderGit2}
              title="No pending projects"
              description="All project titles have been reviewed."
            />
          ) : (
            projects.map((project) => (
              <div key={project._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Collapsed header */}
                <button
                  onClick={() => {
                    setExpanded(expanded === project._id ? null : project._id);
                    setComment('');
                  }}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5 truncate pr-4">
                      {project.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <User className="h-3 w-3" />
                      <span>{project.student?.firstName} {project.student?.lastName}</span>
                      {project.student?.matricNumber && (
                        <><Hash className="h-3 w-3" /><span className="font-mono">{project.student.matricNumber}</span></>
                      )}
                    </div>
                    {project.application?.organizationName && (
                      <p className="text-xs text-gray-400 mt-0.5">Training at: {project.application.organizationName}</p>
                    )}
                  </div>
                  {expanded === project._id
                    ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                </button>

                {/* Expanded detail + actions */}
                {expanded === project._id && (
                  <div className="px-4 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
                    {/* Description */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Description</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {/* Objectives */}
                    {project.objectives?.filter((o) => o).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Objectives</p>
                        <ul className="space-y-1">
                          {project.objectives.filter((o) => o).map((obj, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="w-5 h-5 rounded-full bg-unilorin-primary/10 dark:bg-blue-900/40 text-unilorin-primary dark:text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tech stack */}
                    {project.techStack?.filter((t) => t).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Technologies</p>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.filter((t) => t).map((tech) => (
                            <span key={tech} className="px-2.5 py-1 bg-unilorin-accent dark:bg-blue-900/30 text-unilorin-primary dark:text-blue-400 rounded-full text-xs font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Comment / reason */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        Comment (optional for approval, required for rejection/revision)
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={2}
                        placeholder="Leave a comment for the student..."
                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 resize-none"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(project._id, 'approve')}
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                      >
                        {actionLoading === `approve-${project._id}`
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <CheckCircle className="h-4 w-4" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(project._id, 'revision')}
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                      >
                        {actionLoading === `revision-${project._id}`
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <RefreshCw className="h-4 w-4" />}
                        Revision
                      </button>
                      <button
                        onClick={() => handleAction(project._id, 'reject')}
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                      >
                        {actionLoading === `reject-${project._id}`
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <XCircle className="h-4 w-4" />}
                        Reject
                      </button>
                    </div>
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