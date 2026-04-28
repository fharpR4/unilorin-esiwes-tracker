import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';
import api from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/auth/reset-password/${token}`, { newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Reset Password</title></Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-2">Password reset!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Your password has been updated successfully. You can now log in with your new password.
              </p>
              <Link href="/"
                className="inline-flex items-center justify-center w-full py-3 px-4 bg-unilorin-primary dark:bg-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm">
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-1">Set new password</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Enter your new password below.</p>

              {error && (
                <div className="flex gap-3 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={submitting || !token}
                  className="w-full py-3 px-4 bg-unilorin-primary dark:bg-blue-600 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity text-sm">
                  {submitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}