import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Eye, EyeOff, Mail, Lock, AlertCircle, MapPin, Camera, CheckCircle, GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/theme/ThemeToggle';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ROLE_DASHBOARD_MAP } from '@/lib/constants';

export default function LoginPage() {
  const { login, isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.push(ROLE_DASHBOARD_MAP[user.role]);
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) return <LoadingSpinner fullScreen />;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please enter your email and password.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const loggedInUser = await login(form.email, form.password);
      router.push(ROLE_DASHBOARD_MAP[loggedInUser.role]);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    { icon: MapPin, text: 'GPS Verified Attendance' },
    { icon: Camera, text: 'Camera-Only Logging' },
    { icon: CheckCircle, text: 'Digital Supervisor Approval' },
  ];

  return (
    <>
      <Head>
        <title>UniIlorin E-SIWES — Login</title>
      </Head>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 transition-colors">
        {/* Left panel — Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-unilorin-primary dark:bg-gray-900 flex-col justify-center items-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-unilorin-secondary rounded-full" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-unilorin-secondary rounded-full" />
          </div>
          <div className="relative z-10 text-center max-w-sm">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="h-12 w-12 text-unilorin-secondary" />
            </div>
            <h1 className="text-4xl font-heading font-bold text-white mb-2">University of Ilorin</h1>
            <h2 className="text-2xl font-heading font-semibold text-unilorin-secondary mb-4">
              E-SIWES Progress Tracker
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-8">
              The official electronic platform for Student Industrial Work Experience Scheme.
              Log daily activities, get supervisor approvals, and track your progress - all digitally.
            </p>
            <div className="flex flex-col gap-3">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2.5">
                  <Icon className="h-5 w-5 text-unilorin-secondary flex-shrink-0" />
                  <span className="text-white text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — Login Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-8 relative">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-unilorin-primary dark:bg-blue-900 flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="h-8 w-8 text-unilorin-secondary" />
            </div>
            <h2 className="text-lg font-heading font-bold text-unilorin-primary dark:text-white">
              UniIlorin E-SIWES
            </h2>
          </div>

          <div className="w-full max-w-md">
            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Sign in to your E-SIWES account</p>

            {error && (
              <div className="flex gap-3 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Your password"
                    required
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-unilorin-primary dark:text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-unilorin-primary dark:bg-blue-600 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity text-sm"
              >
                {submitting ? (
                  <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />Signing in...</>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-unilorin-primary dark:text-blue-400 font-medium hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}