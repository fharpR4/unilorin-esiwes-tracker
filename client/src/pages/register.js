import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Eye, EyeOff, User, Mail, Lock, GraduationCap, AlertCircle, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { ROLES, ROLE_DASHBOARD_MAP, ACADEMIC_LEVELS } from '@/lib/constants';
import axios from 'axios';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: ROLES.STUDENT,
    phone: '',
    institution: '',
    courseOfStudy: '',
    matricNumber: '',
    department: '',
    level: '',
  });

  // Fetch institutions on mount — PUBLIC endpoint, no auth needed
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const { data } = await axios.get(`${base}/institutions`);
        setInstitutions(data?.data?.institutions || []);
      } catch (err) {
        console.error('Failed to load institutions:', err.message);
      }
    };
    fetchInstitutions();
  }, []);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const newUser = await register(form);
      router.push(ROLE_DASHBOARD_MAP[newUser.role]);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const needsInstitution = [ROLES.STUDENT, ROLES.COORDINATOR].includes(form.role);
  const isStudent = form.role === ROLES.STUDENT;

  const inputClass = "w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition";

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Register</title></Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 transition-colors">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>

        <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-unilorin-primary flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-5 w-5 text-unilorin-secondary" />
            </div>
            <div>
              <h1 className="text-lg font-heading font-bold text-gray-900 dark:text-white">Create Account</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">UniIlorin E-SIWES Progress Tracker</p>
            </div>
          </div>

          {error && (
            <div className="flex gap-3 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(ROLES).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, role, institution: '' }))}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all capitalize ${
                      form.role === role
                        ? 'bg-unilorin-primary dark:bg-blue-600 text-white border-transparent'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-unilorin-primary'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required
                    placeholder="First name" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required
                    placeholder="Last name" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="email" name="email" value={form.email} onChange={handleChange} required
                  placeholder="your.email@example.com" className={inputClass} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} required placeholder="Min. 6 characters"
                  className={`${inputClass} pr-10`} />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Institution — for students and coordinators */}
            {needsInstitution && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />Institution *
                </label>
                <select name="institution" value={form.institution} onChange={handleChange}
                  required={needsInstitution}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition">
                  <option value="">-- Select your institution --</option>
                  {institutions.length === 0 && (
                    <option disabled>Loading institutions...</option>
                  )}
                  {institutions.map((inst) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.name} ({inst.acronym})
                    </option>
                  ))}
                </select>
                {institutions.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    No institutions loaded. Ask your admin to add institutions first.
                  </p>
                )}
              </div>
            )}

            {/* Student-specific fields */}
            {isStudent && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Matric Number</label>
                    <input type="text" name="matricNumber" value={form.matricNumber} onChange={handleChange}
                      placeholder="e.g. ENG/2021/001"
                      className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition uppercase" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Level</label>
                    <select name="level" value={form.level} onChange={handleChange}
                      className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition">
                      <option value="">Level</option>
                      {ACADEMIC_LEVELS.map((l) => <option key={l} value={l}>{l} Level</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course of Study</label>
                  <input type="text" name="courseOfStudy" value={form.courseOfStudy} onChange={handleChange}
                    placeholder="e.g. Computer Engineering"
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
                  <input type="text" name="department" value={form.department} onChange={handleChange}
                    placeholder="e.g. Electrical and Computer Engineering"
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition" />
                </div>
              </>
            )}

            <button type="submit" disabled={submitting}
              className="w-full py-3 px-4 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity text-sm">
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/" className="text-unilorin-primary dark:text-blue-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}