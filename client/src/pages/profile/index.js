import { useState } from 'react';
import Head from 'next/head';
import {
  User, Mail, Phone, BookOpen, Hash, Building2, Lock,
  Save, Eye, EyeOff, Loader2, CheckCircle, GraduationCap,
  LogOut, Shield, AlertTriangle,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { ROLES, ROLE_LABELS, ACADEMIC_LEVELS } from '@/lib/constants';
import { getInitials, formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    courseOfStudy: user?.courseOfStudy || '',
    matricNumber: user?.matricNumber || '',
    department: user?.department || '',
    level: user?.level || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile', form);
      await refreshUser();
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match.'); return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.'); return;
    }
    setSaving(true);
    try {
      await api.put('/profile/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed.');
    } finally { setSaving(false); }
  };

  const inputClass = "w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition";

  const TABS = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'password', label: 'Security', icon: Lock },
    { key: 'account', label: 'Account', icon: Shield },
  ];

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Profile Settings</title></Head>
      <AppLayout pageTitle="Profile Settings" allowedRoles={Object.values(ROLES)}>
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Profile header */}
          <div className="bg-gradient-to-br from-unilorin-primary to-unilorin-dark dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-unilorin-secondary/30 border-2 border-unilorin-secondary/50 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-heading font-bold text-white">
                  {getInitials(user?.firstName, user?.lastName)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-heading font-bold truncate">{user?.firstName} {user?.lastName}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs bg-unilorin-secondary/20 text-unilorin-secondary border border-unilorin-secondary/30 px-2.5 py-0.5 rounded-full capitalize font-medium">
                    {ROLE_LABELS[user?.role]}
                  </span>
                  {user?.matricNumber && (
                    <span className="text-xs text-white/60 font-mono">{user.matricNumber}</span>
                  )}
                </div>
                <p className="text-xs text-white/50 mt-1 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Student details strip */}
            {user?.role === ROLES.STUDENT && (user?.courseOfStudy || user?.department || user?.level) && (
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-xs text-white/70">
                {user.courseOfStudy && <span><span className="text-white/40">Course: </span>{user.courseOfStudy}</span>}
                {user.department && <span><span className="text-white/40">Dept: </span>{user.department}</span>}
                {user.level && <span><span className="text-white/40">Level: </span>{user.level}</span>}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === key
                    ? 'border-unilorin-primary dark:border-blue-400 text-unilorin-primary dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}>
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Profile Info Form */}
          {tab === 'profile' && (
            <form onSubmit={handleProfileSave} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First Name</label>
                  <input type="text" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Name</label>
                  <input type="text" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />Email Address
                </label>
                <input type="email" value={user?.email || ''} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed. Contact admin if needed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />Phone Number
                </label>
                <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+234 8XX XXX XXXX" className={inputClass} />
              </div>

              {user?.role === ROLES.STUDENT && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5" />Matric Number
                      </label>
                      <input type="text" value={form.matricNumber} onChange={(e) => setForm((p) => ({ ...p, matricNumber: e.target.value }))} placeholder="ENG/2021/001" className={`${inputClass} uppercase`} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5" />Level
                      </label>
                      <select value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} className={inputClass}>
                        <option value="">Select level</option>
                        {ACADEMIC_LEVELS.map((l) => <option key={l} value={l}>{l} Level</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />Course of Study
                    </label>
                    <input type="text" value={form.courseOfStudy} onChange={(e) => setForm((p) => ({ ...p, courseOfStudy: e.target.value }))} placeholder="e.g. Computer Engineering" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />Department
                    </label>
                    <input type="text" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} placeholder="e.g. Electrical and Computer Engineering" className={inputClass} />
                  </div>
                </>
              )}

              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Password Form */}
          {tab === 'password' && (
            <form onSubmit={handlePasswordChange} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Lock className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
                Change Password
              </h3>

              {[
                { key: 'currentPassword', label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent((v) => !v) },
                { key: 'newPassword', label: 'New Password', show: showNew, toggle: () => setShowNew((v) => !v) },
                { key: 'confirmPassword', label: 'Confirm New Password', show: showConfirm, toggle: () => setShowConfirm((v) => !v) },
              ].map(({ key, label, show, toggle }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                  <div className="relative">
                    <input type={show ? 'text' : 'password'} value={passwords[key]}
                      onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))} required
                      placeholder={key === 'currentPassword' ? 'Your current password' : 'Min. 6 characters'}
                      className={`${inputClass} pr-10`} />
                    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {key === 'confirmPassword' && passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                  )}
                </div>
              ))}

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  After changing your password, all other sessions on other devices will be signed out automatically.
                </p>
              </div>

              <button type="submit" disabled={saving || !passwords.currentPassword || !passwords.newPassword}
                className="flex items-center gap-2 px-6 py-3 bg-unilorin-primary dark:bg-blue-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}

          {/* Account tab — logout + danger zone */}
          {tab === 'account' && (
            <div className="space-y-4">
              {/* Account info */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
                  Account Information
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Email', value: user?.email },
                    { label: 'Role', value: ROLE_LABELS[user?.role] },
                    { label: 'Account Status', value: user?.isActive ? 'Active' : 'Inactive' },
                    { label: 'Member Since', value: user?.createdAt ? formatDate(user.createdAt) : 'N/A' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sign out section — visible on all devices especially mobile */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <LogOut className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
                  Sign Out
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Sign out from your E-SIWES account on this device. Your data is safely stored.
                </p>

                {!logoutConfirm ? (
                  <button onClick={() => setLogoutConfirm(true)}
                    className="flex items-center gap-2 w-full justify-center py-3 px-4 border-2 border-unilorin-primary dark:border-blue-500 text-unilorin-primary dark:text-blue-400 rounded-xl font-semibold text-sm hover:bg-unilorin-accent dark:hover:bg-blue-900/20 transition-colors">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 dark:text-amber-400">Are you sure you want to sign out?</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={logout}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors">
                        <LogOut className="h-4 w-4" />
                        Yes, Sign Out
                      </button>
                      <button onClick={() => setLogoutConfirm(false)}
                        className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:opacity-80 transition-opacity">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}