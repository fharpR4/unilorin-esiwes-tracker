import Head from 'next/head';
import {
  BarChart3, TrendingUp, CheckCircle, Clock, XCircle,
  CalendarCheck, Target, Award,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import useApi from '@/hooks/useApi';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ROLES } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';

const ProgressRing = ({ value, max, size = 120, strokeWidth = 10, color = '#1a3a5c' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(value / Math.max(max, 1), 1);
  const offset = circumference - percent * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor"
        strokeWidth={strokeWidth} className="text-gray-200 dark:text-gray-700" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
        strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  );
};

const MiniBar = ({ value, max, color = 'bg-unilorin-primary dark:bg-blue-500' }) => (
  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
    <div className={`h-full ${color} rounded-full transition-all duration-700`}
      style={{ width: `${Math.min((value / Math.max(max, 1)) * 100, 100)}%` }} />
  </div>
);

export default function AnalyticsPage() {
  const { user } = useAuth();
  const isCoordinator = user?.role === ROLES.COORDINATOR;

  const { data: studentResp, isLoading: studentLoading } = useApi(
    user?.role === ROLES.STUDENT ? '/profile/analytics' : null
  );
  const { data: coordResp, isLoading: coordLoading } = useApi(
    isCoordinator ? '/profile/coordinator-analytics' : null
  );

  const isLoading = studentLoading || coordLoading;

  if (isLoading) {
    return (
      <AppLayout pageTitle="Analytics" allowedRoles={[ROLES.STUDENT, ROLES.COORDINATOR]}>
        <LoadingSpinner />
      </AppLayout>
    );
  }

  // Correct data paths
  const s = studentResp?.data?.summary || {};
  const wt = studentResp?.data?.weeklyTrend || [];
  const ca = coordResp?.data || {};

  return (
    <>
      <Head><title>UniIlorin E-SIWES — Analytics</title></Head>
      <AppLayout pageTitle="Analytics" allowedRoles={[ROLES.STUDENT, ROLES.COORDINATOR]}>

        {user?.role === ROLES.STUDENT && (
          <div className="space-y-5 max-w-3xl mx-auto">
            {/* Progress ring */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-5 flex items-center gap-2">
                <Target className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
                SIWES Completion Progress
              </h3>
              <div className="flex items-center gap-8">
                <div className="relative flex-shrink-0">
                  <ProgressRing
                    value={s.approvedLogs || 0}
                    max={s.totalDaysRequired || 90}
                    size={140}
                    strokeWidth={12}
                    color={s.exceedingTarget ? '#c49200' : '#1a3a5c'}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-heading font-bold text-unilorin-primary dark:text-blue-400">
                      {s.progress || 0}%
                    </span>
                    <span className="text-xs text-gray-400">Complete</span>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  {[
                    { label: 'Approved Logs', value: s.approvedLogs || 0, max: s.totalDaysRequired || 90, color: 'bg-green-500' },
                    { label: 'Total Submitted', value: s.totalLogs || 0, max: s.totalDaysRequired || 90, color: 'bg-unilorin-primary dark:bg-blue-500' },
                    { label: 'Attendance Days', value: s.totalAttendance || 0, max: s.totalDaysRequired || 90, color: 'bg-unilorin-secondary' },
                  ].map(({ label, value, max, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>{label}</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{value}/{max}</span>
                      </div>
                      <MiniBar value={value} max={max} color={color} />
                    </div>
                  ))}
                  {s.exceedingTarget && (
                    <p className="text-xs text-unilorin-secondary font-semibold">
                      +{s.extraDays} days beyond required — excellent!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: CheckCircle, label: 'Approved Logs', value: s.approvedLogs || 0, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                { icon: Clock, label: 'Pending', value: s.pendingLogs || 0, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                { icon: XCircle, label: 'Rejected', value: s.rejectedLogs || 0, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                { icon: CalendarCheck, label: 'Hours Worked', value: `${s.totalHours || 0}h`, color: 'text-unilorin-secondary', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className={`rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center ${bg}`}>
                  <Icon className={`h-5 w-5 mx-auto mb-2 ${color}`} />
                  <p className="text-xl font-heading font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            {/* Weekly trend bar chart */}
            {wt.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-5 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
                  Weekly Log Trend (Last 12 Weeks)
                </h3>
                <div className="flex items-end gap-1.5 h-32">
                  {wt.map((week, i) => {
                    const maxLogs = Math.max(...wt.map((w) => w.logs), 1);
                    const heightPct = (week.logs / maxLogs) * 100;
                    const approvedPct = week.logs > 0 ? (week.approved / week.logs) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {week.logs} logs, {week.approved} approved
                        </div>
                        <div className="w-full flex flex-col justify-end rounded-t overflow-hidden" style={{ height: `${Math.max(heightPct, 4)}%` }}>
                          <div className="bg-green-500" style={{ height: `${approvedPct}%` }} />
                          <div className="bg-gray-200 dark:bg-gray-600 flex-1" />
                        </div>
                        {i % 3 === 0 && (
                          <p className="text-xs text-gray-400 truncate w-full text-center" style={{ fontSize: 9 }}>{week.week}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <div className="w-3 h-3 rounded bg-green-500" />Approved
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-600" />Other
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {isCoordinator && (
          <div className="space-y-5 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: Award, label: 'Total Students', value: ca.studentCount || 0, color: 'text-unilorin-primary dark:text-blue-400' },
                { icon: BarChart3, label: 'Applications', value: ca.appCount || 0, color: 'text-unilorin-secondary' },
                { icon: CheckCircle, label: 'Approved Logs', value: ca.approvedLogs || 0, color: 'text-green-500' },
                { icon: Clock, label: 'Pending Logs', value: ca.pendingLogs || 0, color: 'text-yellow-500' },
                { icon: TrendingUp, label: 'Total Logs', value: ca.logCount || 0, color: 'text-unilorin-primary dark:text-blue-400' },
                { icon: Target, label: 'Approval Rate', value: `${ca.approvalRate || 0}%`, color: 'text-green-500' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                  </div>
                  <p className="text-3xl font-heading font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* Approval rate ring */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-8">
              <div className="relative flex-shrink-0">
                <ProgressRing value={ca.approvalRate || 0} max={100} size={120} strokeWidth={10} color="#22c55e" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-heading font-bold text-green-500">{ca.approvalRate || 0}%</span>
                  <span className="text-xs text-gray-400">Approval Rate</span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-heading font-semibold text-gray-800 dark:text-gray-200 mb-1">Institution Log Approval Rate</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {ca.approvedLogs || 0} of {ca.logCount || 0} submitted logs approved across all students in your institution.
                </p>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </>
  );
}