import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Forgot Password</title></Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-unilorin-primary dark:hover:text-blue-400 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          {submitted ? (
            <div className="text-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                If an account with <strong>{email}</strong> exists, a password reset link has been sent.
                The link expires in 1 hour.
              </p>
              <Link href="/" className="inline-block mt-6 text-sm text-unilorin-primary dark:text-blue-400 hover:underline font-medium">
                Return to login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-1">Forgot password?</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Enter your registered email address and we&apos;ll send you a reset link.
              </p>

              {error && (
                <div className="flex gap-3 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your.email@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition" />
                  </div>
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full py-3 px-4 bg-unilorin-primary dark:bg-blue-600 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity text-sm">
                  {submitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}