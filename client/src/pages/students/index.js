import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Users, Search, ChevronRight } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { ROLES } from '@/lib/constants';
import { getInitials } from '@/lib/utils';

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useApi(`/users/students${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  const students = data?.students || [];

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Students</title></Head>
      <AppLayout pageTitle="All Students" allowedRoles={[ROLES.COORDINATOR, ROLES.ADMIN]}>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, matric number or email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition" />
          </div>

          {isLoading ? <LoadingSpinner /> : students.length === 0 ? (
            <EmptyState icon={Users} title="No students found" description={search ? `No results for "${search}"` : 'No students registered yet.'} />
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <Link key={student._id} href={`/students/${student._id}`}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-unilorin-primary dark:hover:border-blue-500 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-unilorin-primary dark:bg-blue-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">{getInitials(student.firstName, student.lastName)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{student.firstName} {student.lastName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {student.matricNumber || 'No matric'} · {student.courseOfStudy || student.email}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-unilorin-primary dark:group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}