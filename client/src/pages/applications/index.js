import { useState } from 'react';
import Head from 'next/head';
import {
  FileCheck, Plus, CheckCircle, XCircle, Clock, Building2,
  Calendar, User, ChevronDown, ChevronUp, Send, Loader2, X,
  Search, Filter, GraduationCap,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { ROLES, NIGERIAN_STATES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700', label: 'Pending Review' },
  approved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700', label: 'Rejected' },
  completed: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700', label: 'Completed' },
};

const EMPTY_FORM = {
  organizationName: '',
  street: '',
  city: '',
  state: '',
  startDate: '',
  expectedEndDate: '',
  totalDaysRequired: '90',
  supervisorId: '',
};

export default function ApplicationsPage() {
  const { toast } = useToast();
  const { data: appsResp, isLoading, mutate } = useApi('/applications/mine');

  // Supervisor search state
  const [supSearch, setSupSearch] = useState('');
  const [supInstitution, setSupInstitution] = useState('');
  const [supFaculty, setSupFaculty] = useState('');
  const [showSupFilter, setShowSupFilter] = useState(false);

  // Build supervisor query
  const supParams = new URLSearchParams();
  if (supSearch) supParams.set('search', supSearch);
  if (supInstitution) supParams.set('institution', supInstitution);
  if (supFaculty) supParams.set('faculty', supFaculty);
  const { data: supervisorsResp, isLoading: supLoading } = useApi(`/users/supervisors?${supParams.toString()}`);

  const { data: institutionsResp } = useApi('/institutions');

  const applications = appsResp?.data?.applications || appsResp?.applications || [];
  const supervisors = supervisorsResp?.data?.supervisors || [];
  const institutions = institutionsResp?.data?.institutions || [];

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  const hasActive = applications.some((a) => ['pending', 'approved'].includes(a.status));

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSelectSupervisor = (sup) => {
    setSelectedSupervisor(sup);
    setForm((p) => ({ ...p, supervisorId: sup._id }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.supervisorId) {
      toast.error('Please select a supervisor.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/applications', {
        organizationName: form.organizationName,
        organizationAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          country: 'Nigeria',
        },
        startDate: form.startDate,
        expectedEndDate: form.expectedEndDate,
        totalDaysRequired: parseInt(form.totalDaysRequired) || 90,
        supervisor: form.supervisorId,
      });
      toast.success('SIWES application submitted. Awaiting coordinator approval.');
      mutate();
      setShowForm(false);
      setForm(EMPTY_FORM);
      setSelectedSupervisor(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally { setSubmitting(false); }
  };

  const inputClass = "w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition";

  const NIGERIAN_FACULTIES = [
    'Faculty of Agriculture', 'Faculty of Arts', 'Faculty of Basic Medical Sciences',
    'Faculty of Business and Social Sciences', 'Faculty of Communication and Information Sciences',
    'Faculty of Education', 'Faculty of Engineering and Technology', 'Faculty of Environmental Sciences',
    'Faculty of Law', 'Faculty of Life Sciences', 'Faculty of Management Sciences',
    'Faculty of Pharmaceutical Sciences', 'Faculty of Physical Sciences', 'Faculty of Social Sciences',
    'Faculty of Veterinary Medicine', 'College of Health Sciences', 'College of Medicine',
  ];

  return (
    <>
      <Head><title>UniIlorin E-SIWES — SIWES Applications</title></Head>
      <AppLayout pageTitle="SIWES Applications" allowedRoles={[ROLES.STUDENT]}>
        <div className="max-w-2xl mx-auto space-y-5">

          {/* No active application CTA */}
          {!hasActive && !showForm && (
            <div className="bg-unilorin-primary dark:bg-blue-900/40 rounded-2xl p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="h-6 w-6 text-unilorin-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold mb-1">No Active Application</h3>
                  <p className="text-sm text-white/70 mb-4">
                    You need an approved SIWES application before you can submit project titles, daily logs, or attendance records.
                  </p>
                  <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-unilorin-secondary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
                    <Plus className="h-4 w-4" />
                    Apply for SIWES Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons when there are existing apps */}
          {hasActive && !showForm && (
            <div className="flex justify-end">
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                <Plus className="h-4 w-4" />
                New Application
              </button>
            </div>
          )}

          {/* Application form */}
          {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-heading font-bold text-gray-900 dark:text-white">Submit SIWES Application</h3>
                <button onClick={() => { setShowForm(false); setSelectedSupervisor(null); setForm(EMPTY_FORM); }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organization Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" />Training Organization
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Organization Name *</label>
                    <input type="text" name="organizationName" value={form.organizationName} onChange={handleChange} required
                      placeholder="e.g. Nigerian National Petroleum Corporation" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
                      <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Ilorin" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">State</label>
                      <select name="state" value={form.state} onChange={handleChange} className={inputClass}>
                        <option value="">Select state</option>
                        {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />Training Duration
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Date *</label>
                      <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Expected End Date *</label>
                      <input type="date" name="expectedEndDate" value={form.expectedEndDate} onChange={handleChange} required className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Required Training Days
                      <span className="ml-2 text-xs text-gray-400 font-normal">(You can continue logging beyond this)</span>
                    </label>
                    <input type="number" name="totalDaysRequired" value={form.totalDaysRequired} onChange={handleChange}
                      min="1" max="365" className={inputClass} />
                  </div>
                </div>

                {/* Supervisor Selection */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />Select Your Supervisor *
                  </h4>

                  {/* Selected supervisor display */}
                  {selectedSupervisor && (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-400">
                          {selectedSupervisor.title && `${selectedSupervisor.title} `}
                          {selectedSupervisor.firstName} {selectedSupervisor.lastName}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-500">
                          {selectedSupervisor.supervisorDepartment && `${selectedSupervisor.supervisorDepartment} · `}
                          {selectedSupervisor.supervisorInstitution || selectedSupervisor.faculty}
                        </p>
                      </div>
                      <button type="button" onClick={() => { setSelectedSupervisor(null); setForm((p) => ({ ...p, supervisorId: '' })); }}
                        className="text-green-600 hover:text-red-500 transition-colors p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Filter controls */}
                  <button type="button" onClick={() => setShowSupFilter((v) => !v)}
                    className="flex items-center gap-2 text-xs text-unilorin-primary dark:text-blue-400 hover:underline">
                    <Filter className="h-3 w-3" />
                    {showSupFilter ? 'Hide filters' : 'Filter supervisors by school/faculty'}
                  </button>

                  {showSupFilter && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Institution</label>
                        <select value={supInstitution} onChange={(e) => setSupInstitution(e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-unilorin-primary">
                          <option value="">All institutions</option>
                          {institutions.map((inst) => (
                            <option key={inst._id} value={inst._id}>{inst.acronym || inst.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Faculty</label>
                        <select value={supFaculty} onChange={(e) => setSupFaculty(e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-unilorin-primary">
                          <option value="">All faculties</option>
                          {NIGERIAN_FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Name search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" value={supSearch} onChange={(e) => setSupSearch(e.target.value)}
                      placeholder="Search supervisor by name, staff ID..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition" />
                  </div>

                  {/* Supervisor list */}
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {supLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    ) : supervisors.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 text-sm">
                        No supervisors found. Try adjusting your filters.
                      </div>
                    ) : (
                      supervisors.map((sup) => (
                        <button type="button" key={sup._id} onClick={() => handleSelectSupervisor(sup)}
                          className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            form.supervisorId === sup._id
                              ? 'border-unilorin-primary dark:border-blue-500 bg-unilorin-accent dark:bg-blue-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-unilorin-primary/50 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}>
                          <div className="w-9 h-9 rounded-full bg-unilorin-primary/10 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="h-5 w-5 text-unilorin-primary dark:text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {sup.title && `${sup.title} `}{sup.firstName} {sup.lastName}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {[sup.supervisorDepartment, sup.faculty, sup.supervisorInstitution].filter(Boolean).join(' · ')}
                            </p>
                            {sup.staffId && <p className="text-xs text-gray-400">ID: {sup.staffId}</p>}
                          </div>
                          {form.supervisorId === sup._id && (
                            <CheckCircle className="h-5 w-5 text-unilorin-primary dark:text-blue-400 flex-shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  <p className="text-xs text-gray-400">
                    Don&apos;t see your supervisor? Ask them to register on the platform and complete their profile setup.
                  </p>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Your coordinator will review and approve this application. You will receive a notification once processed.
                  </p>
                </div>

                <button type="submit"
                  disabled={submitting || !form.organizationName || !form.startDate || !form.expectedEndDate || !form.supervisorId}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity">
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  {submitting ? 'Submitting Application...' : 'Submit SIWES Application'}
                </button>
              </form>
            </div>
          )}

          {/* Applications list */}
          {isLoading ? <LoadingSpinner /> : applications.length === 0 && !showForm ? (
            <EmptyState icon={FileCheck} title="No applications yet" description="Apply for SIWES to get started." />
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                const StatusIcon = sc.icon;
                return (
                  <div key={app._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button
                      onClick={() => setExpanded(expanded === app._id ? null : app._id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusIcon className={`h-4 w-4 flex-shrink-0 ${sc.color}`} />
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {app.organizationName}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {formatDate(app.startDate)} — {formatDate(app.expectedEndDate)} · {app.totalDaysRequired} days required
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sc.color} ${sc.bg}`}>
                          {sc.label}
                        </span>
                        {expanded === app._id
                          ? <ChevronUp className="h-4 w-4 text-gray-400" />
                          : <ChevronDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </button>

                    {expanded === app._id && (
                      <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
                        <div className={`flex items-start gap-3 p-3 rounded-xl border ${sc.bg}`}>
                          <StatusIcon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${sc.color}`} />
                          <div>
                            <p className={`text-sm font-medium ${sc.color}`}>Application {sc.label}</p>
                            {app.coordinatorComment && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{app.coordinatorComment}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {app.supervisor && (
                            <div>
                              <p className="text-gray-400 mb-0.5">Supervisor</p>
                              <p className="font-medium text-gray-700 dark:text-gray-300">
                                {app.supervisor?.firstName} {app.supervisor?.lastName}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-400 mb-0.5">Required Days</p>
                            <p className="font-medium text-gray-700 dark:text-gray-300">{app.totalDaysRequired} days</p>
                          </div>
                          {app.organizationAddress?.city && (
                            <div>
                              <p className="text-gray-400 mb-0.5">Location</p>
                              <p className="font-medium text-gray-700 dark:text-gray-300">
                                {app.organizationAddress.city}, {app.organizationAddress.state}
                              </p>
                            </div>
                          )}
                        </div>

                        {app.status === 'approved' && (
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
                            <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                              Application approved. You can now submit logs, mark attendance, and submit your project title.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}