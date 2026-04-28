import Head from 'next/head';
import { ScrollText, User, Calendar } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { ROLES } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';

// Activity logs are internal — this page shows the concept.
// Full implementation requires an admin-only endpoint on the server.
export default function ActivityLogsPage() {
  return (
    <>
      <Head><title>UniIlorin E-SIWES — Activity Logs</title></Head>
      <AppLayout pageTitle="Activity Logs" allowedRoles={[ROLES.ADMIN]}>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
            <p className="text-sm text-amber-800 dark:text-amber-400">
              Activity logs are recorded automatically in the database for every significant user action (login, log submission, approval, password change, etc.). Use MongoDB Compass or add a paginated admin endpoint to query the <code className="bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded text-xs">activitylogs</code> collection.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <ScrollText className="h-5 w-5 text-unilorin-primary dark:text-blue-400" />
              <h3 className="text-base font-heading font-semibold text-gray-800 dark:text-gray-200">Tracked Actions</h3>
            </div>
            <div className="space-y-2">
              {[
                'ATTENDANCE_CHECK_IN — Student checks in with GPS',
                'ATTENDANCE_CHECK_OUT — Student checks out',
                'PROJECT_SUBMITTED — Student submits project title',
                'PROJECT_APPROVED — Supervisor approves project',
                'PROFILE_UPDATED — User updates their profile',
                'PASSWORD_CHANGED — User changes their password',
                'AUTH (login/register) — Auth events via auth controller',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-unilorin-primary dark:bg-blue-400 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}