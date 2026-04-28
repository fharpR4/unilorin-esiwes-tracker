import { useState } from 'react';
import Head from 'next/head';
import {
  FolderGit2, Plus, Pencil, Send, CheckCircle, XCircle,
  AlertTriangle, Loader2, RefreshCw, X,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { ROLES, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';

const EMPTY_FORM = { title: '', description: '', objectives: [''], techStack: [''] };

export default function MyProjectPage() {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useApi('/projects/mine');
  const project = data?.project;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const openForm = () => {
    if (project && project.status !== 'approved') {
      setForm({
        title: project.title,
        description: project.description,
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

  const addArrayItem = (field) => setForm((p) => ({ ...p, [field]: [...p[field], ''] }));
  const removeArrayItem = (field, index) => setForm((p) => ({ ...p, [field]: p[field].filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        objectives: form.objectives.filter((o) => o.trim()),
        techStack: form.techStack.filter((t) => t.trim()),
      };

      if (project && project.status !== 'approved') {
        await api.put(`/projects/${project._id}`, payload);
        toast.success('Project updated and resubmitted for approval.');
      } else {
        await api.post('/projects', payload);
        toast.success('Project title submitted for supervisor approval.');
      }
      mutate();
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally { setSubmitting(false); }
  };

  const statusConfig = project ? {
    approved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' },
    rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' },
    revision_requested: { icon: RefreshCw, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' },
    pending: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' },
  }[project.status] : null;

  return (
    <>
      <Head><title>UniIlorin E-SIWES — My Project</title></Head>
      <AppLayout pageTitle="My Project Title" allowedRoles={[ROLES.STUDENT]}>
        <div className="max-w-2xl mx-auto space-y-5">

          {!project && !isLoading && !showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-10 text-center">
              <FolderGit2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-heading font-bold text-gray-800 dark:text-gray-200 mb-2">No Project Title Yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                Submit your SIWES project title for supervisor approval before you can start submitting daily logs.
              </p>
              <button onClick={openForm}
                className="flex items-center gap-2 px-5 py-2.5 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity mx-auto">
                <Plus className="h-4 w-4" />
                Submit Project Title
              </button>
            </div>
          )}

          {project && !showForm && (
            <div className="space-y-4">
              {/* Status banner */}
              {statusConfig && (
                <div className={`flex items-start gap-3 p-4 rounded-xl border ${statusConfig.bg}`}>
                  <statusConfig.icon className={`h-5 w-5 ${statusConfig.color} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className={`text-sm font-semibold ${statusConfig.color}`}>{PROJECT_STATUS_LABELS[project.status]}</p>
                    {project.supervisorComment && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.supervisorComment}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Project card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FolderGit2 className="h-5 w-5 text-unilorin-primary dark:text-blue-400" />
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PROJECT_STATUS_COLORS[project.status]}`}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </span>
                    </div>
                    <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">{project.title}</h2>
                  </div>
                  {project.status !== 'approved' && (
                    <button onClick={openForm}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-unilorin-primary dark:text-blue-400 border border-unilorin-primary dark:border-blue-500 rounded-lg hover:bg-unilorin-accent dark:hover:bg-blue-900/20 transition-colors flex-shrink-0">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{project.description}</p>

                {project.objectives?.filter((o) => o).length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Objectives</p>
                    <ul className="space-y-1">
                      {project.objectives.filter((o) => o).map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="w-4 h-4 rounded-full bg-unilorin-primary/10 dark:bg-blue-900/40 text-unilorin-primary dark:text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.techStack?.filter((t) => t).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Tech Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.filter((t) => t).map((tech) => (
                        <span key={tech} className="px-2.5 py-1 bg-unilorin-accent dark:bg-blue-900/30 text-unilorin-primary dark:text-blue-400 rounded-full text-xs font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.approvedAt && (
                  <p className="text-xs text-gray-400 mt-4">Approved on {formatDateTime(project.approvedAt)}</p>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-heading font-bold text-gray-900 dark:text-white">
                  {project && project.status !== 'approved' ? 'Update Project Title' : 'Submit Project Title'}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project Title <span className="text-red-500">*</span></label>
                  <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required
                    placeholder="e.g. Online Student Result Management System"
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Description <span className="text-red-500">*</span>
                    <span className={`ml-2 text-xs font-normal ${form.description.length >= 30 ? 'text-green-500' : 'text-gray-400'}`}>
                      {form.description.length}/30 min
                    </span>
                  </label>
                  <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required rows={4}
                    placeholder="Briefly describe what your project does and its impact..."
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition resize-none" />
                </div>

                {/* Objectives */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project Objectives</label>
                  <div className="space-y-2">
                    {form.objectives.map((obj, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="w-6 h-10 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">{i + 1}.</span>
                        <input type="text" value={obj} onChange={(e) => handleArrayChange('objectives', i, e.target.value)}
                          placeholder={`Objective ${i + 1}`}
                          className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition" />
                        {form.objectives.length > 1 && (
                          <button type="button" onClick={() => removeArrayItem('objectives', i)} className="p-2.5 text-gray-400 hover:text-red-500 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem('objectives')}
                      className="flex items-center gap-1.5 text-xs text-unilorin-primary dark:text-blue-400 hover:underline">
                      <Plus className="h-3.5 w-3.5" /> Add objective
                    </button>
                  </div>
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Technologies / Tools</label>
                  <div className="space-y-2">
                    {form.techStack.map((tech, i) => (
                      <div key={i} className="flex gap-2">
                        <input type="text" value={tech} onChange={(e) => handleArrayChange('techStack', i, e.target.value)}
                          placeholder={`e.g. React, Node.js, MongoDB`}
                          className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition" />
                        {form.techStack.length > 1 && (
                          <button type="button" onClick={() => removeArrayItem('techStack', i)} className="p-2.5 text-gray-400 hover:text-red-500 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addArrayItem('techStack')}
                      className="flex items-center gap-1.5 text-xs text-unilorin-primary dark:text-blue-400 hover:underline">
                      <Plus className="h-3.5 w-3.5" /> Add technology
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={submitting || !form.title || form.description.length < 30}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity">
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