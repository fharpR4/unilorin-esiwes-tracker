import Head from 'next/head';
import { useState } from 'react';
import { FolderGit2, CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { ROLES } from '@/lib/constants';
import EmptyState from '@/components/shared/EmptyState';

export default function PendingProjectsPage() {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useApi('/projects/pending');
  const projects = data?.projects || [];
  const [expanded, setExpanded] = useState(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const handleApprove = async (projectId) => {
    setActionLoading(`approve-${projectId}`);
    try {
      await api.patch(`/projects/${projectId}/approve`, { comment });
      toast.success('Project title approved.');
      mutate();
      setExpanded(null);
      setComment('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setActionLoading(''); }
  };

  const handleReject = async (projectId, requestRevision = false) => {
    if (!comment.trim()) { toast.error('Please provide a reason.'); return; }
    setActionLoading(`reject-${projectId}`);
    try {
      await api.patch(`/projects/${projectId}/reject`, { reason: comment, requestRevision });
      toast.success(requestRevision ? 'Revision requested.' : 'Project rejected.');
      mutate();
      setExpanded(null);
      setComment('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setActionLoading(''); }
  };

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Project Approvals</title></Head>
      <AppLayout pageTitle="Project Approvals" allowedRoles={[ROLES.SUPERVISOR]}>
        <div className="space-y-4 max-w-2xl mx-auto">
          {isLoading ? null : projects.length === 0 ? (
            <EmptyState icon={FolderGit2} title="No pending projects" description="All project titles have been reviewed." />
          ) : (
            projects.map((project) => (
              <div key={project._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button onClick={() => setExpanded(expanded === project._id ? null : project._id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5">{project.title}</p>
                    <p className="text-xs text-gray-400">{project.student?.firstName} {project.student?.lastName} · {project.student?.matricNumber}</p>
                  </div>
                  {expanded === project._id ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                </button>

                {expanded === project._id && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>

                    {project.objectives?.filter((o) => o).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Objectives</p>
                        <ul className="space-y-1">
                          {project.objectives.filter((o) => o).map((obj, i) => (
                            <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="text-unilorin-primary dark:text-blue-400 font-bold">{i + 1}.</span>{obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {project.techStack?.filter((t) => t).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.techStack.filter((t) => t).map((tech) => (
                          <span key={tech} className="px-2 py-0.5 bg-unilorin-accent dark:bg-blue-900/30 text-unilorin-primary dark:text-blue-400 rounded text-xs">{tech}</span>
                        ))}
                      </div>
                    )}

                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2}
                      placeholder="Comment or rejection reason (required for reject/revision)..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 resize-none" />

                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(project._id)} disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                        {actionLoading === `approve-${project._id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        Approve
                      </button>
                      <button onClick={() => handleReject(project._id, true)} disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                        {actionLoading === `reject-${project._id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Revision
                      </button>
                      <button onClick={() => handleReject(project._id, false)} disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                        {actionLoading === `reject-${project._id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
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