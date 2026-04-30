import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft, User, Mail, BookOpen, MapPin, ChevronRight,
  Hash, GraduationCap, Building2, CalendarCheck,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import LocationMap from '@/components/geolocation/LocationMap';
import { ROLES, LOG_STATUS_COLORS, LOG_STATUS_LABELS } from '@/lib/constants';
import { formatDate, getInitials } from '@/lib/utils';

export default function StudentLogViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: studentResp, isLoading: studentLoading } = useApi(id ? `/users/${id}` : null);
  const { data: logsResp, isLoading: logsLoading } = useApi(id ? `/logs/student/${id}` : null);
  const { data: attendanceResp } = useApi(id ? `/attendance/student/${id}` : null);
  const { data: reportsResp } = useApi(id ? `/reports/student/${id}` : null);

  const student = studentResp?.data?.user;
  const logs = logsResp?.data?.logs || [];
  const attendance = attendanceResp?.data?.records || [];
  const attendanceStats = attendanceResp?.data?.stats || {};
  const reports = reportsResp?.data?.reports || [];

  const lastLog = logs.filter((l) => l.geolocation?.coordinates?.length >= 2).slice(-1)[0];
  const approvedCount = logs.filter((l) => l.status === 'approved').length;
  const pendingCount = logs.filter((l) => l.status === 'pending').length;

  if (studentLoading) {
    return (
      <AppLayout pageTitle="Student Detail" allowedRoles={[ROLES.COORDINATOR, ROLES.ADMIN]}>
        <LoadingSpinner />
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout pageTitle="Student Detail" allowedRoles={[ROLES.COORDINATOR, ROLES.ADMIN]}>
        <div className="text-center py-16 text-gray-400">Student not found.</div>
      </AppLayout>
    );
  }

  return (
    <>
      <Head><title>UniIlorin E-SIWES — {student.firstName} {student.lastName}</title></Head>
      <AppLayout pageTitle="Student Detail" allowedRoles={[ROLES.COORDINATOR, ROLES.ADMIN]}>
        <div className="max-w-2xl mx-auto space-y-5">
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-unilorin-primary dark:hover:text-blue-400 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </button>

          {/* Student profile card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-unilorin-primary dark:bg-blue-700 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-heading font-bold text-white">
                  {getInitials(student.firstName, student.lastName)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                  {student.firstName} {student.lastName}
                </h2>
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />{student.email}
                  </span>
                  {student.matricNumber && (
                    <span className="flex items-center gap-1 font-mono">
                      <Hash className="h-3 w-3" />{student.matricNumber}
                    </span>
                  )}
                  {student.department && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />{student.department}
                    </span>
                  )}
                  {student.level && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />{student.level} Level
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              {[
                { label: 'Total Logs', value: logs.length, icon: BookOpen, color: 'text-unilorin-primary dark:text-blue-400' },
                { label: 'Approved', value: approvedCount, icon: BookOpen, color: 'text-green-500' },
                { label: 'Pending', value: pendingCount, icon: BookOpen, color: 'text-yellow-500' },
                { label: 'Days Present', value: attendanceStats.presentDays || 0, icon: CalendarCheck, color: 'text-unilorin-secondary' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Last known location */}
          {lastLog?.geolocation?.coordinates && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
                Last Logged Location
              </h3>
              <LocationMap
                coordinates={lastLog.geolocation.coordinates}
                accuracy={lastLog.geolocation.accuracy}
              />
              <p className="text-xs text-gray-400 mt-2">
                From Day {lastLog.dayNumber} log on {formatDate(lastLog.dateOfActivity)}
              </p>
            </div>
          )}

          {/* Attendance summary */}
          {attendance.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
                Attendance Summary
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{attendanceStats.totalDays || 0}</p>
                  <p className="text-xs text-gray-400">Total Days</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{attendanceStats.presentDays || 0}</p>
                  <p className="text-xs text-gray-400">Present</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-lg font-bold text-unilorin-secondary">{attendanceStats.totalHours || 0}h</p>
                  <p className="text-xs text-gray-400">Total Hours</p>
                </div>
              </div>
            </div>
          )}

          {/* Logs list */}
          <div>
            <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
              All Logs ({logs.length})
            </h3>
            {logsLoading ? (
              <LoadingSpinner />
            ) : logs.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 text-sm">
                No logs submitted yet.
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <Link key={log._id} href={`/logs/${log._id}`}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-unilorin-primary dark:hover:border-blue-500 transition-colors group">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        Day {log.dayNumber} — {log.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LOG_STATUS_COLORS[log.status]}`}>
                          {LOG_STATUS_LABELS[log.status]}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(log.dateOfActivity)}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-unilorin-primary dark:group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Weekly reports */}
          {reports.length > 0 && (
            <div>
              <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
                Weekly Reports ({reports.length})
              </h3>
              <div className="space-y-2">
                {reports.map((report) => (
                  <div key={report._id} className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Week {report.weekNumber}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        report.status === 'reviewed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(report.startDate)} — {formatDate(report.endDate)}
                      · {report.daysAttended} days · {report.logsCount} logs
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}