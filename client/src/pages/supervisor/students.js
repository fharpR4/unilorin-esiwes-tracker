import Head from 'next/head';
import { useState } from 'react';
import {
  Users, UserPlus, Search, X, ChevronRight, Loader2,
  CheckCircle, Building2, BookOpen, Filter, Hash,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { ROLES } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function SupervisorStudentsPage() {
  const { toast } = useToast();

  // My assigned students
  const { data: myStudentsResp, isLoading: myLoading, mutate } = useApi('/users/my-students');

  // All institutions for filtering
  const { data: institutionsResp } = useApi('/institutions');

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [assigning, setAssigning] = useState('');
  const [removing, setRemoving] = useState('');

  // Fetch students for assignment — with filters
  const queryParams = new URLSearchParams();
  if (search) queryParams.set('search', search);
  if (selectedInstitution) queryParams.set('institution', selectedInstitution);
  if (department) queryParams.set('department', department);
  const { data: browseResp, isLoading: browseLoading } = useApi(
    showSearch ? `/users/students-for-assignment?${queryParams.toString()}` : null
  );

  // Correct data paths
  const appStudents = myStudentsResp?.data?.applicationStudents || [];
  const manualStudents = myStudentsResp?.data?.manualStudents || [];
  const browseStudents = browseResp?.data?.students || [];
  const institutions = institutionsResp?.data?.institutions || [];

  const alreadyAssignedIds = new Set([
    ...appStudents.map((s) => s._id?.toString()),
    ...manualStudents.map((s) => s._id?.toString()),
  ]);

  const availableStudents = browseStudents.filter((s) => !alreadyAssignedIds.has(s._id?.toString()));

  const handleAssign = async (studentId) => {
    setAssigning(studentId);
    try {
      await api.post('/users/assign-student', { studentId });
      toast.success('Student added to your list.');
      mutate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign student.');
    } finally { setAssigning(''); }
  };

  const handleRemove = async (studentId) => {
    setRemoving(studentId);
    try {
      await api.delete(`/users/assigned-students/${studentId}`);
      toast.success('Student removed.');
      mutate();
    } catch (err) {
      toast.error('Failed to remove student.');
    } finally { setRemoving(''); }
  };

  const StudentCard = ({ student, badge, showRemove = false }) => (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="w-10 h-10 rounded-full bg-unilorin-primary dark:bg-blue-700 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-white">
          {getInitials(student.firstName, student.lastName)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {student.firstName} {student.lastName}
          </p>
          {badge && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-gray-400">
          {student.matricNumber && (
            <span className="flex items-center gap-0.5 font-mono">
              <Hash className="h-3 w-3" />{student.matricNumber}
            </span>
          )}
          {student.department && <span>· {student.department}</span>}
          {student.institution?.name && <span>· {student.institution.name}</span>}
          {student.organizationName && <span>· Training at {student.organizationName}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Link href={`/students/${student._id}`}
          className="p-1.5 text-gray-400 hover:text-unilorin-primary dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <ChevronRight className="h-4 w-4" />
        </Link>
        {showRemove && (
          <button onClick={() => handleRemove(student._id)} disabled={removing === student._id}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
            {removing === student._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Head><title>UniIlorin E-SIWES — My Students</title></Head>
      <AppLayout pageTitle="My Students" allowedRoles={[ROLES.SUPERVISOR]}>
        <div className="max-w-2xl mx-auto space-y-5">

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {appStudents.length + manualStudents.length} student{(appStudents.length + manualStudents.length) !== 1 ? 's' : ''} assigned to you
            </p>
            <button onClick={() => setShowSearch((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                showSearch
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  : 'bg-unilorin-primary dark:bg-blue-600 text-white hover:opacity-90'
              }`}>
              {showSearch ? <><X className="h-4 w-4" />Close Search</> : <><UserPlus className="h-4 w-4" />Add Student</>}
            </button>
          </div>

          {/* Student search + filter panel */}
          {showSearch && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
              <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Filter className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
                Find a Student to Add
              </h3>

              {/* Institution filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />Filter by Institution
                </label>
                <select
                  value={selectedInstitution}
                  onChange={(e) => setSelectedInstitution(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition"
                >
                  <option value="">All Institutions</option>
                  {institutions.map((inst) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.name} ({inst.acronym})
                    </option>
                  ))}
                </select>
              </div>

              {/* Department filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />Filter by Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science, Electrical Engineering..."
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition"
                />
              </div>

              {/* Name/matric search */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5" />Search by Name or Matric
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Name, matric number, or email..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-unilorin-primary dark:focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto space-y-2 -mx-1 px-1">
                {browseLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : availableStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    {search || selectedInstitution || department
                      ? 'No students match your filters.'
                      : 'Enter filters above to search for students.'}
                  </div>
                ) : (
                  availableStudents.map((student) => (
                    <div key={student._id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                            {getInitials(student.firstName, student.lastName)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {student.matricNumber && `${student.matricNumber} · `}
                            {student.department || student.email}
                            {student.institution?.name && ` · ${student.institution.acronym || student.institution.name}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssign(student._id)}
                        disabled={assigning === student._id}
                        className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-unilorin-primary dark:bg-blue-600 text-white rounded-lg text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 ml-2"
                      >
                        {assigning === student._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
                        Add
                      </button>
                    </div>
                  ))
                )}
              </div>

              {browseResp?.count > 0 && (
                <p className="text-xs text-gray-400 text-center">
                  Showing {availableStudents.length} of {browseResp.count} students
                </p>
              )}
            </div>
          )}

          {/* My assigned students */}
          {myLoading ? <LoadingSpinner /> : (
            <>
              {/* Via approved applications */}
              {appStudents.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    Via Approved Applications ({appStudents.length})
                  </h3>
                  <div className="space-y-2">
                    {appStudents.map((student) => (
                      <StudentCard key={student._id} student={student} badge="Via Application" />
                    ))}
                  </div>
                </div>
              )}

              {/* Manually assigned */}
              {manualStudents.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-unilorin-primary dark:text-blue-400" />
                    Manually Added ({manualStudents.length})
                  </h3>
                  <div className="space-y-2">
                    {manualStudents.map((student) => (
                      <StudentCard key={student._id} student={student} showRemove />
                    ))}
                  </div>
                </div>
              )}

              {appStudents.length === 0 && manualStudents.length === 0 && !showSearch && (
                <EmptyState
                  icon={Users}
                  title="No students yet"
                  description="Students who submit SIWES applications with you as supervisor will appear here automatically. You can also manually add students."
                  action={
                    <button
                      onClick={() => setShowSearch(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-unilorin-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add a Student
                    </button>
                  }
                />
              )}
            </>
          )}
        </div>
      </AppLayout>
    </>
  );
}