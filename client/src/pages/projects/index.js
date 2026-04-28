import Head from 'next/head';
import { useState } from 'react';
import { FolderGit2, Filter, ChevronDown } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { ROLES, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function AllProjectsPage() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useApi(`/projects${status ? `?status=${status}` : ''}`);
  const projects = data?.projects || [];

  return (
    <>
      <Head><title>UniIlorin E-SIWES — All Projects</title></Head>
      <AppLayout pageTitle="All Projects" allowedRoles={[ROLES.COORDINATOR, ROLES.ADMIN]}>
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            {['', 'pending', 'approved', 'rejected', 'revision_requested'].map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  status === s
                    ? 'bg-unilorin-primary dark:bg-blue-600 text-white border-transparent'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-unilorin-primary dark:hover:border-blue-500'
                }`}>
                {s ? PROJECT_STATUS_LABELS[s] : 'All'}
              </button>
            ))}
          </div>

          {isLoading ? <LoadingSpinner /> : projects.length === 0 ? (
            <EmptyState icon={FolderGit2} title="No projects" description="No project titles submitted yet." />
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5">{project.title}</p>
                      <p className="text-xs text-gray-400">
                        {project.student?.firstName} {project.student?.lastName} · {project.student?.matricNumber}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Supervisor: {project.supervisor?.firstName} {project.supervisor?.lastName}
                      </p>
                      <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">Submitted {formatDate(project.createdAt)}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${PROJECT_STATUS_COLORS[project.status]}`}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                  </div>
                  {project.supervisorComment && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 pl-3 border-l-2 border-gray-200 dark:border-gray-600 italic">
                      {project.supervisorComment}
                    </p>
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