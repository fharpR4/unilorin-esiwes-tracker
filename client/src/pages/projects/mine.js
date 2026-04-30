import { useState } from 'react';
import Head from 'next/head';
import {
  FolderGit2, Plus, Pencil, Send, CheckCircle, XCircle,
  AlertTriangle, Loader2, RefreshCw, X, Clock,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { ROLES, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const EMPTY_FORM = {
  title: '',
  description: '',
  objectives: [''],
  techStack: [''],
};

const STATUS_ICONS = {
  approved: CheckCircle,
  rejected: XCircle,
  revision_requested: RefreshCw,
  pending: Clock,
};

const STATUS_STYLES = {
  approved: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400',
  rejected: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400',
  revision_requested: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-400',
  pending: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400',
};

export default function MyProjectPage() {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useApi('/projects/mine');
  const project = data?.data?.project || null;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const openForm = (isEdit = false) => {
    if (isEdit && project) {
      setForm({
        title: project.title || '',
        description: project.description || '',
        objectives: project.objectives?.length ? project.objectives : [''],
        techStack: project.techStack?.length ? project.techStack : [''],
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setShowForm(true);
  };

  const handleArrayChange = (field, index, value) => {
    setForm((p) => {
      const arr = [...p[field]];
      arr[index] = value;
      return { ...p, [field]: arr };
    });
  };

  const addItem = (field) => setForm((p) => ({ ...p, [field]: [...p[field], ''] }));
  const removeItem = (field, index) => setForm((p) => ({
    ...p,
    [field]: p[field].filter((_, i) => i !== index),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      objectives: form.objectives.filter((o) => o.trim()),
      techStack: form.techStack.filter((t) => t.trim()),
    };
    setSubmitting(true);
    try {
      if (project && ['rejected', 'revision_requested', 'pending'].includes(project.status)) {
        await api.put(`/projects/${project._id}`, payload);
        toast.success('Project updated and resubmitted for supervisor review.');
      } else {
        await api.post('/projects', payload);
        toast.success('Project title submitted for supervisor approval.');
      }
      mutate();
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout pageTitle="My Project Title" allowedRoles={[ROLES.STUDENT]}>
        <LoadingSpinner />
      </AppLayout>
    );
  }

  return (
    <>
      <Head><title>UniIlorin E-SIWES — My Project Title</title></Head>
      <AppLayout pageTitle="My Project Title" allowedRoles={[ROLES.STUDENT]}>
        <div className="max-w-2xl mx-auto space-y-5">

          {/* No project + no form */}
          {!project && !showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-10 text-center">
              <FolderGit2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-heading font-bold text-gray-800 dark:text-gray-200 mb-2">
                No Project Title Yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                Submit your SIWES project title for supervisor approval. You need an approved SIWES application first.
              </p>
              <button
                onClick={() => openForm(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity mx-auto"
              >
                <Plus className="h-4 w-4" />
                Submit Project Title
              </button>
            </div>
          )}

          {/* Existing project display */}
          {project && !showForm && (
            <div className="space-y-4">
              {/* Status banner */}
              {(() => {
                const StatusIcon = STATUS_ICONS[project.status] || Clock;
                const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES.pending;
                return (
                  <div className={`flex items-start gap-3 p-4 rounded-xl border ${statusStyle}`}>
                    <StatusIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{PROJECT_STATUS_LABELS[project.status]}</p>
                      {project.supervisorComment && (
                        <p className="text-sm mt-0.5 opacity-80">{project.supervisorComment}</p>
                      )}
                    </div>
                    {['rejected', 'revision_requested', 'pending'].includes(project.status) && (
                      <button
                        onClick={() => openForm(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 dark:bg-gray-800/50 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity flex-shrink-0"
                      >
                        <Pencil className="h-3.5 w-3.5" />Edit
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Project card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FolderGit2 className="h-5 w-5 text-unilorin-primary dark:text-blue-400 flex-shrink-0" />
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PROJECT_STATUS_COLORS[project.status]}`}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </span>
                    </div>
                    <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                      {project.title}
                    </h2>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  {project.description}
                </p>

                {project.objectives?.filter((o) => o).length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Objectives
                    </p>
                    <ul className="space-y-1.5">
                      {project.objectives.filter((o) => o).map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="w-5 h-5 rounded-full bg-unilorin-primary/10 dark:bg-blue-900/40 text-unilorin-primary dark:text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.techStack?.filter((t) => t).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Tech Stack
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.filter((t) => t).map((tech) => (
                        <span key={tech} className="px-2.5 py-1 bg-unilorin-accent dark:bg-blue-900/30 text-unilorin-primary dark:text-blue-400 rounded-full text-xs font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
                  <span>Supervisor: {project.supervisor?.title && `${project.supervisor.title} `}{project.supervisor?.firstName} {project.supervisor?.lastName}</span>
                  {project.approvedAt && <span className="ml-3">· Approved {formatDateTime(project.approvedAt)}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-heading font-bold text-gray-900 dark:text-white">
                  {project ? 'Update Project Title' : 'Submit Project Title'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    required
                    minLength={5}
                    placeholder="e.g. Online Student Result Management System"
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Description <span className="text-red-500">*</span>
                    <span className={`ml-2 text-xs font-normal ${form.description.length >= 30 ? 'text-green-500' : 'text-gray-400'}`}>
                      ({form.description.length}/30 min)
                    </span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    required
                    rows={4}
                    placeholder="Describe what your project does and its expected impact..."
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition resize-none"
                  />
                </div>

                {/* Objectives */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Objectives
                  </label>
                  <div className="space-y-2">
                    {form.objectives.map((obj, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="text-xs text-gray-400 w-5 flex-shrink-0 text-right">{i + 1}.</span>
                        <input
                          type="text"
                          value={obj}
                          onChange={(e) => handleArrayChange('objectives', i, e.target.value)}
                          placeholder={`Objective ${i + 1}`}
                          className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition"
                        />
                        {form.objectives.length > 1 && (
                          <button type="button" onClick={() => removeItem('objectives', i)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addItem('objectives')}
                      className="flex items-center gap-1 text-xs text-unilorin-primary dark:text-blue-400 hover:underline">
                      <Plus className="h-3 w-3" />Add objective
                    </button>
                  </div>
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Technologies / Tools
                  </label>
                  <div className="space-y-2">
                    {form.techStack.map((tech, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={tech}
                          onChange={(e) => handleArrayChange('techStack', i, e.target.value)}
                          placeholder="e.g. React, Node.js, MongoDB"
                          className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition"
                        />
                        {form.techStack.length > 1 && (
                          <button type="button" onClick={() => removeItem('techStack', i)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addItem('techStack')}
                      className="flex items-center gap-1 text-xs text-unilorin-primary dark:text-blue-400 hover:underline">
                      <Plus className="h-3 w-3" />Add technology
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !form.title || form.description.length < 30}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  {submitting ? 'Submitting...' : 'Submit for Approval'}
                </button>
              </form>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}