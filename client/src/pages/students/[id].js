import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, User, Mail, BookOpen, MapPin, ChevronRight } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import LocationMap from '@/components/geolocation/LocationMap';
import Link from 'next/link';
import { ROLES, LOG_STATUS_COLORS, LOG_STATUS_LABELS } from '@/lib/constants';
import { formatDate, getInitials } from '@/lib/utils';

export default function StudentLogViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: studentData, isLoading: studentLoading } = useApi(id ? `/users/${id}` : null);
  const { data: logsData, isLoading: logsLoading } = useApi(id ? `/logs/student/${id}` : null);
  const student = studentData?.user;
  const logs = logsData?.logs || [];

  const lastLog = logs[logs.length - 1];

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Student Logs</title></Head>
      <AppLayout pageTitle="Student Logs" allowedRoles={[ROLES.COORDINATOR, ROLES.ADMIN]}>
        <div className="max-w-2xl mx-auto space-y-5">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-unilorin-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </button>

          {studentLoading ? <LoadingSpinner /> : student && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-unilorin-primary dark:bg-blue-700 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{getInitials(student.firstName, student.lastName)}</span>
                </div>
                <div>
                  <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">{student.firstName} {student.lastName}</h2>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{student.email}</span>
                    {student.matricNumber && <span className="flex items-center gap-1"><User className="h-3 w-3" />{student.matricNumber}</span>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{logs.length}</p>
                  <p className="text-xs text-gray-400">Total Logs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{logs.filter((l) => l.status === 'approved').length}</p>
                  <p className="text-xs text-gray-400">Approved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-500">{logs.filter((l) => l.status === 'pending').length}</p>
                  <p className="text-xs text-gray-400">Pending</p>
                </div>
              </div>
            </div>
          )}

          {lastLog?.geolocation?.coordinates && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
                Last Known Location
              </h3>
              <LocationMap coordinates={lastLog.geolocation.coordinates} accuracy={lastLog.geolocation.accuracy} />
            </div>
          )}

          <div>
            <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
              All Logs ({logs.length})
            </h3>
            {logsLoading ? <LoadingSpinner /> : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <Link key={log._id} href={`/logs/${log._id}`}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-unilorin-primary transition-colors group">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Day {log.dayNumber} — {log.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LOG_STATUS_COLORS[log.status]}`}>
                          {LOG_STATUS_LABELS[log.status]}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(log.dateOfActivity)}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-unilorin-primary transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
}