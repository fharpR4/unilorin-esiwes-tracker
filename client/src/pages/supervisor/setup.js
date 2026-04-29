import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { GraduationCap, Building2, Hash, Save, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import ThemeToggle from '@/components/theme/ThemeToggle';
import api from '@/lib/api';
import { ROLES } from '@/lib/constants';

const NIGERIAN_FACULTIES = [
  'Faculty of Agriculture', 'Faculty of Arts', 'Faculty of Basic Medical Sciences',
  'Faculty of Business and Social Sciences', 'Faculty of Communication and Information Sciences',
  'Faculty of Education', 'Faculty of Engineering and Technology', 'Faculty of Environmental Sciences',
  'Faculty of Law', 'Faculty of Life Sciences', 'Faculty of Management Sciences',
  'Faculty of Pharmaceutical Sciences', 'Faculty of Physical Sciences', 'Faculty of Social Sciences',
  'Faculty of Veterinary Medicine', 'College of Health Sciences', 'College of Medicine', 'Other',
];

export default function SupervisorSetupPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: user?.title || '',
    supervisorInstitution: user?.supervisorInstitution || '',
    faculty: user?.faculty || '',
    supervisorDepartment: user?.supervisorDepartment || '',
    staffId: user?.staffId || '',
    phone: user?.phone || '',
  });

  // Redirect non-supervisors
  useEffect(() => {
    if (user && user.role !== ROLES.SUPERVISOR) {
      router.push(`/dashboard/${user.role}`);
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile', form);
      await refreshUser();
      toast.success('Supervisor profile set up successfully.');
      router.push('/dashboard/supervisor');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed. Please try again.');
    } finally { setSaving(false); }
  };

  const inputClass = "w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition";

  const isComplete = user?.faculty && user?.supervisorDepartment;

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Supervisor Setup</title></Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 transition-colors">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-unilorin-primary flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-unilorin-secondary" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-1">
              Complete Your Profile
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              As a supervisor, please provide your academic details so students can find and select you.
            </p>
          </div>

          {isComplete && (
            <div className="flex items-center gap-3 p-4 mb-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-400">Profile already set up. You can update below.</p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title / Honorific</label>
                <select value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={inputClass}>
                  <option value="">Select your title</option>
                  {['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Engr.', 'Arc.', 'Pharm.'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Institution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />Institution / School *
                </label>
                <input type="text" value={form.supervisorInstitution} onChange={(e) => setForm((p) => ({ ...p, supervisorInstitution: e.target.value }))} required
                  placeholder="e.g. University of Ilorin" className={inputClass} />
              </div>

              {/* Faculty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Faculty *</label>
                <select value={form.faculty} onChange={(e) => setForm((p) => ({ ...p, faculty: e.target.value }))} required className={inputClass}>
                  <option value="">Select faculty</option>
                  {NIGERIAN_FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department *</label>
                <input type="text" value={form.supervisorDepartment} onChange={(e) => setForm((p) => ({ ...p, supervisorDepartment: e.target.value }))} required
                  placeholder="e.g. Department of Computer Science" className={inputClass} />
              </div>

              {/* Staff ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />Staff ID
                </label>
                <input type="text" value={form.staffId} onChange={(e) => setForm((p) => ({ ...p, staffId: e.target.value }))}
                  placeholder="e.g. UNILORIN/STAFF/0042" className={inputClass} />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+234 8XX XXX XXXX" className={inputClass} />
              </div>

              <button type="submit" disabled={saving || !form.supervisorInstitution || !form.faculty || !form.supervisorDepartment}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {saving ? 'Saving...' : isComplete ? 'Update Profile' : 'Complete Setup'}
              </button>

              {isComplete && (
                <button type="button" onClick={() => router.push('/dashboard/supervisor')}
                  className="w-full py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-unilorin-primary dark:hover:text-blue-400 transition-colors">
                  Skip for now
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}