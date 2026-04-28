import Head from 'next/head';
import { useState } from 'react';
import { Search, UserCheck, UserX, ChevronDown } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { ROLES, ROLE_LABELS } from '@/lib/constants';
import { getInitials, formatDateShort } from '@/lib/utils';

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { data, isLoading, mutate } = useApi(`/users?${search ? `search=${encodeURIComponent(search)}&` : ''}${roleFilter ? `role=${roleFilter}` : ''}`);
  const users = data?.users || [];

  const toggleActive = async (userId, isActive) => {
    try {
      await api.patch(`/users/${userId}/${isActive ? 'deactivate' : 'reactivate'}`);
      toast.success(`User ${isActive ? 'deactivated' : 'reactivated'} successfully.`);
      mutate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  return (
    <>
      <Head><title>UniIlorin E-SIWES — User Management</title></Head>
      <AppLayout pageTitle="User Management" allowedRoles={[ROLES.ADMIN]}>
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition" />
            </div>
            <div className="relative">
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-3 pr-8 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition appearance-none">
                <option value="">All Roles</option>
                {Object.values(ROLES).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {isLoading ? <LoadingSpinner /> : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user._id} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${user.isActive ? 'bg-unilorin-primary dark:bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className="text-xs font-bold text-white">{getInitials(user.firstName, user.lastName)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.firstName} {user.lastName}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 capitalize">{user.role}</span>
                      {!user.isActive && <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">Inactive</span>}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{user.email} · Joined {formatDateShort(user.createdAt)}</p>
                  </div>
                  <button onClick={() => toggleActive(user._id, user.isActive)}
                    title={user.isActive ? 'Deactivate user' : 'Reactivate user'}
                    className={`p-2 rounded-lg transition-colors ${user.isActive ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500' : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500'}`}>
                    {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}