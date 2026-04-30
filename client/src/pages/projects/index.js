import Head from 'next/head';
import { useState } from 'react';
import { FolderGit2, Filter } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { ROLES, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function AllProjectsPage() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useApi(`/projects${status ? `?status=${status}` : ''}`);
  const projects = data?.data?.projects || [];
  const total = data?.count || 0;

  const statuses = ['', 'pending', 'approved', 'rejected', 'revision_requested'];

  return (
    <>
      <Head><title>UniIlorin E-SIWES — All Projects</title></Head>
      <AppLayout pageTitle="All Project Titles" allowedRoles={[ROLES.COORDINATOR, ROLES.ADMIN]}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
            {statuses.map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  status === s
                    ? 'bg-unilorin-primary dark:bg-blue-600 text-white border-transparent'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-unilorin-primary'
                }`}>
                {s ? PROJECT_STATUS_LABELS[s] : 'All'}
              </button>
            ))}
            {total > 0 && (
              <span className="ml-auto text-xs text-gray-400">{total} total</span>
            )}
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : projects.length === 0 ? (
            <EmptyState icon={FolderGit2} title="No projects found" description="No project titles have been submitted yet." />
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5">
                        {project.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {project.student?.firstName} {project.student?.lastName}
                        {project.student?.matricNumber && ` · ${project.student.matricNumber}`}
                        {project.student?.department && ` · ${project.student.department}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Supervisor: {project.supervisor?.title && `${project.supervisor.title} `}
                        {project.supervisor?.firstName} {project.supervisor?.lastName}
                      </p>
                      {project.application?.organizationName && (
                        <p className="text-xs text-gray-400 mt-0.5">Training at: {project.application.organizationName}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${PROJECT_STATUS_COLORS[project.status]}`}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                    {project.description}
                  </p>

                  {project.techStack?.filter((t) => t).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.filter((t) => t).map((tech) => (
                        <span key={tech} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {project.supervisorComment && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 pl-3 border-l-2 border-gray-200 dark:border-gray-600 italic">
                      {project.supervisorComment}
                    </p>
                  )}

                  <p className="text-xs text-gray-300 dark:text-gray-600 mt-2">
                    Submitted {formatDate(project.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}