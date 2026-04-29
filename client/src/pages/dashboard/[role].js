import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  BookOpen, ClipboardCheck, Users, CheckCircle, XCircle, Clock,
  TrendingUp, Plus, ArrowRight, UserCog, CalendarCheck, FolderGit2,
  FileText, Bell, LogIn, LogOut, Target, Award, BarChart3,
  FileCheck, Hash, Star,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import useApi from '@/hooks/useApi';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  ROLES, LOG_STATUS_COLORS, LOG_STATUS_LABELS,
  PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS,
} from '@/lib/constants';
import { formatDate, formatRelativeTime, getInitials } from '@/lib/utils';

const StatCard = ({ icon: Icon, label, value, sub, color = 'text-unilorin-primary dark:text-blue-400', href }) => {
  const inner = (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-unilorin-primary dark:hover:border-blue-500 transition-colors h-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-tight">{label}</span>
      </div>
      <p className="text-3xl font-heading font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
};

const QuickAction = ({ href, icon: Icon, label, description, color = 'bg-unilorin-primary dark:bg-blue-700' }) => (
  <Link href={href}
    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-unilorin-primary dark:hover:border-blue-500 transition-colors group">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
      {description && <p className="text-xs text-gray-400 truncate mt-0.5">{description}</p>}
    </div>
    <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-unilorin-primary dark:group-hover:text-blue-400 flex-shrink-0 transition-colors" />
  </Link>
);

// Progress ring — uncapped, shows over 100%
const ProgressRingSmall = ({ approved, required, size = 80 }) => {
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(approved / Math.max(required, 1), 1);
  const offset = circumference - percent * circumference;
  const isOver = approved > required;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-white/20" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={isOver ? '#c49200' : 'white'} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-heading font-bold text-white leading-none">
          {approved}
        </span>
        <span className="text-xs text-white/60 leading-none">/{required}</span>
      </div>
    </div>
  );
};

function StudentDashboard() {
  const { user } = useAuth();
  const { data: logsData, isLoading: logsLoading } = useApi('/logs?limit=5');
  const { data: appsData } = useApi('/applications/mine');
  const { data: analyticsData } = useApi('/profile/analytics');
  const { data: todayAttendance } = useApi('/attendance/today');
  const { data: projectData } = useApi('/projects/mine');
  const { data: notifData } = useApi('/notifications?limit=1');

  const logs = logsData?.data?.logs || logsData?.logs || [];
  const applications = appsData?.data?.applications || appsData?.applications || [];
  const activeApp = applications.find((a) => a.status === 'approved');
  const pendingApp = applications.find((a) => a.status === 'pending');
  const s = analyticsData?.data?.summary || {};
  const today = todayAttendance?.data?.attendance;
  const project = projectData?.data?.project;
  const unread = notifData?.unreadCount || 0;

  if (logsLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      {/* Student identity strip */}
      {user?.matricNumber && (
        <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Hash className="h-4 w-4 text-unilorin-primary dark:text-blue-400 flex-shrink-0" />
          <span className="text-sm font-mono font-semibold text-gray-800 dark:text-gray-200">{user.matricNumber}</span>
          {user.courseOfStudy && <span className="text-xs text-gray-400">· {user.courseOfStudy}</span>}
          {user.level && <span className="text-xs text-gray-400">· {user.level} Level</span>}
        </div>
      )}

      {/* Active training + progress */}
      {activeApp ? (
        <div className="bg-gradient-to-r from-unilorin-primary to-unilorin-dark dark:from-blue-900 dark:to-gray-900 rounded-2xl p-5 text-white">
          <div className="flex items-start gap-4">
            <ProgressRingSmall approved={s.approvedLogs || 0} required={s.totalDaysRequired || 90} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/60 mb-0.5">Active Training</p>
              <p className="text-base font-heading font-bold truncate">{activeApp.organizationName}</p>
              <p className="text-xs text-white/60 mt-1">
                {s.approvedLogs || 0} of {s.totalDaysRequired || 90} days approved
                {s.exceedingTarget && (
                  <span className="ml-2 text-unilorin-secondary font-semibold">
                    · +{s.extraDays} bonus days!
                  </span>
                )}
              </p>
              <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${s.exceedingTarget ? 'bg-unilorin-secondary' : 'bg-white'}`}
                  style={{ width: `${Math.min((s.approvedLogs || 0) / (s.totalDaysRequired || 90) * 100, 100)}%` }}
                />
              </div>
              {s.exceedingTarget && (
                <div className="flex items-center gap-1 mt-1.5">
                  <Star className="h-3 w-3 text-unilorin-secondary" />
                  <span className="text-xs text-unilorin-secondary font-medium">Exceeded required days — keep going!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : pendingApp ? (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
          <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Application Pending Approval</p>
            <p className="text-xs text-yellow-600 dark:text-yellow-500">{pendingApp.organizationName} — awaiting coordinator review</p>
          </div>
          <Link href="/applications" className="text-xs text-yellow-700 dark:text-yellow-400 font-medium hover:underline">View</Link>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-unilorin-primary dark:bg-blue-900/40 rounded-xl">
          <FileCheck className="h-5 w-5 text-unilorin-secondary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">No SIWES Application</p>
            <p className="text-xs text-white/60">Submit an application to start your training journey</p>
          </div>
          <Link href="/applications"
            className="flex-shrink-0 px-3 py-1.5 bg-unilorin-secondary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity">
            Apply Now
          </Link>
        </div>
      )}

      {/* Today's attendance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <CalendarCheck className="h-5 w-5 text-unilorin-primary dark:text-blue-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Today&apos;s Attendance</p>
              <p className="text-xs text-gray-400 truncate">
                {today?.checkIn?.time
                  ? `In: ${new Date(today.checkIn.time).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Not checked in yet'}
                {today?.checkOut?.time && ` · Out: ${new Date(today.checkOut.time).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`}
                {today?.hoursWorked > 0 && ` · ${today.hoursWorked}h`}
              </p>
            </div>
          </div>
          <Link href="/attendance"
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-unilorin-primary dark:bg-blue-600 text-white rounded-lg text-xs font-medium hover:opacity-90 transition-opacity">
            {!today?.checkIn?.time ? <><LogIn className="h-3.5 w-3.5" />Check In</> :
              !today?.checkOut?.time ? <><LogOut className="h-3.5 w-3.5" />Check Out</> :
              <><CheckCircle className="h-3.5 w-3.5" />Done</>}
          </Link>
        </div>
      </div>

      {/* Project status */}
      {project && (
        <div className={`flex items-center justify-between p-4 rounded-xl border ${
          project.status === 'approved' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' :
          project.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' :
          'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
        }`}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <FolderGit2 className={`h-5 w-5 flex-shrink-0 ${project.status === 'approved' ? 'text-green-500' : project.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{project.title}</p>
              <p className="text-xs text-gray-400 capitalize">{PROJECT_STATUS_LABELS[project.status]}</p>
            </div>
          </div>
          <Link href="/projects/mine" className="flex-shrink-0 text-xs text-unilorin-primary dark:text-blue-400 font-medium hover:underline ml-3">View</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={BookOpen} label="Total Logs" value={s.totalLogs || 0} href="/logs" />
        <StatCard icon={CheckCircle} label="Approved" value={s.approvedLogs || 0} color="text-green-500" href="/logs?status=approved" />
        <StatCard icon={Clock} label="Pending" value={s.pendingLogs || 0} color="text-yellow-500" href="/logs?status=pending" />
        <StatCard icon={CalendarCheck} label="Days Present" value={s.totalAttendance || 0} color="text-unilorin-secondary" href="/attendance" />
      </div>

      {/* Notifications */}
      {unread > 0 && (
        <Link href="/notifications"
          className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
          <Bell className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-300 flex-1">
            You have <strong>{unread}</strong> unread notification{unread !== 1 ? 's' : ''}.
          </p>
          <ArrowRight className="h-4 w-4 text-blue-400 flex-shrink-0" />
        </Link>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeApp ? (
            <>
              <QuickAction href="/logs/new" icon={Plus} label="Submit Daily Log" description="Camera + GPS required" />
              <QuickAction href="/attendance" icon={CalendarCheck} label="Mark Attendance" description="Check in or check out today" color="bg-green-600" />
              <QuickAction href="/projects/mine" icon={FolderGit2} label="My Project Title" description={project ? PROJECT_STATUS_LABELS[project.status] : 'Submit for supervisor approval'} color="bg-purple-600" />
              <QuickAction href="/reports" icon={FileText} label="Weekly Reports" description="Submit your weekly summary" color="bg-unilorin-secondary" />
            </>
          ) : (
            <>
              <QuickAction href="/applications" icon={FileCheck} label="Apply for SIWES" description="Submit your training application first" color="bg-unilorin-secondary" />
              <QuickAction href="/profile" icon={UserCog} label="Complete Profile" description="Add matric number, department, level" color="bg-purple-600" />
            </>
          )}
        </div>
      </div>

      {/* Recent logs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200">Recent Logs</h2>
          <Link href="/logs" className="flex items-center gap-1 text-xs text-unilorin-primary dark:text-blue-400 hover:underline font-medium">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {logs.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <BookOpen className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              {activeApp ? 'No logs yet. Submit your first daily log.' : 'Get an approved application first, then start logging.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <Link key={log._id} href={`/logs/${log._id}`}
                className="flex items-center justify-between p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-unilorin-primary dark:hover:border-blue-500 transition-colors group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-gray-400">Day {log.dayNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LOG_STATUS_COLORS[log.status]}`}>
                      {LOG_STATUS_LABELS[log.status]}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{log.title}</p>
                  <p className="text-xs text-gray-400">{formatRelativeTime(log.createdAt)}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-unilorin-primary dark:group-hover:text-blue-400 flex-shrink-0 ml-3 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SupervisorDashboard() {
  const { user } = useAuth();
  const { data: pendingLogsData, isLoading } = useApi('/logs/pending');
  const { data: pendingProjectsData } = useApi('/projects/pending');
  const { data: pendingReportsData } = useApi('/reports/pending');
  const { data: myStudentsData } = useApi('/users/my-students');
  const { data: notifData } = useApi('/notifications?limit=1');

  const logs = pendingLogsData?.data?.logs || pendingLogsData?.logs || [];
  const projects = pendingProjectsData?.data?.projects || [];
  const reports = pendingReportsData?.data?.reports || [];
  const totalStudents = myStudentsData?.data?.total || 0;
  const unread = notifData?.unreadCount || 0;

  // Prompt setup if no faculty/department set
  const needsSetup = !user?.faculty || !user?.supervisorDepartment;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      {needsSetup && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
          <Award className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Complete your supervisor profile</p>
            <p className="text-xs text-amber-600 dark:text-amber-500">Add your faculty and department so students can find and select you.</p>
          </div>
          <Link href="/supervisor/setup"
            className="flex-shrink-0 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity">
            Set Up
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="My Students" value={totalStudents} href="/supervisor/students" />
        <StatCard icon={ClipboardCheck} label="Pending Logs" value={logs.length} color="text-yellow-500" href="/approvals" />
        <StatCard icon={FolderGit2} label="Pending Projects" value={projects.length} color="text-purple-500" href="/projects/pending" />
        <StatCard icon={FileText} label="Pending Reports" value={reports.length} color="text-blue-500" href="/reports/pending" />
      </div>

      {unread > 0 && (
        <Link href="/notifications" className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
          <Bell className="h-5 w-5 text-blue-500" />
          <p className="text-sm text-blue-800 dark:text-blue-300 flex-1">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
          <ArrowRight className="h-4 w-4 text-blue-400" />
        </Link>
      )}

      <div>
        <h2 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <QuickAction href="/supervisor/students" icon={Users} label="Manage Students" description={`${totalStudents} student${totalStudents !== 1 ? 's' : ''} assigned to you`} />
          <QuickAction href="/approvals" icon={ClipboardCheck} label="Review Logs" description={`${logs.length} log${logs.length !== 1 ? 's' : ''} awaiting review`} />
          <QuickAction href="/projects/pending" icon={FolderGit2} label="Review Projects" description={`${projects.length} project title${projects.length !== 1 ? 's' : ''}`} color="bg-purple-600" />
          <QuickAction href="/reports/pending" icon={FileText} label="Review Reports" description={`${reports.length} report${reports.length !== 1 ? 's' : ''} to review`} color="bg-blue-600" />
        </div>
      </div>

      {/* Latest pending logs preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200">Latest Pending Logs</h2>
          <Link href="/approvals" className="text-xs text-unilorin-primary dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {logs.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">All caught up. No pending logs.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 5).map((log) => (
              <Link key={log._id} href={`/logs/${log._id}`}
                className="flex items-center justify-between p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-unilorin-primary transition-colors group">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{log.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {log.student?.firstName} {log.student?.lastName} · Day {log.dayNumber} · {formatDate(log.dateOfActivity)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-3 ${LOG_STATUS_COLORS[log.status]}`}>
                  {LOG_STATUS_LABELS[log.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CoordinatorDashboard() {
  const { data: studentsData, isLoading } = useApi('/users/students?limit=5');
  const { data: analyticsData } = useApi('/profile/coordinator-analytics');
  const { data: appsData } = useApi('/applications?status=pending&limit=5');
  const students = studentsData?.data?.students || [];
  const ca = analyticsData?.data || {};
  const pendingApps = appsData?.data?.applications || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon={Users} label="Total Students" value={ca.studentCount || 0} href="/students" />
        <StatCard icon={CheckCircle} label="Approved Logs" value={ca.approvedLogs || 0} color="text-green-500" />
        <StatCard icon={Target} label="Approval Rate" value={`${ca.approvalRate || 0}%`} color="text-unilorin-secondary" href="/analytics" />
        <StatCard icon={Clock} label="Pending Logs" value={ca.pendingLogs || 0} color="text-yellow-500" />
        <StatCard icon={FolderGit2} label="Total Logs" value={ca.logCount || 0} />
        <StatCard icon={FileCheck} label="Applications" value={ca.appCount || 0} />
      </div>

      {pendingApps.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {pendingApps.length} Pending Application{pendingApps.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="space-y-2">
            {pendingApps.map((app) => (
              <div key={app._id} className="flex items-center justify-between text-xs">
                <span className="text-yellow-800 dark:text-yellow-300">
                  {app.student?.firstName} {app.student?.lastName} → {app.organizationName}
                </span>
                <span className="text-yellow-600 dark:text-yellow-500">{formatDate(app.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <QuickAction href="/students" icon={Users} label="View All Students" description="Browse and monitor student progress" />
          <QuickAction href="/projects" icon={FolderGit2} label="All Project Titles" description="Monitor all student project submissions" color="bg-purple-600" />
          <QuickAction href="/analytics" icon={BarChart3} label="Analytics" description="Institution-wide performance stats" color="bg-unilorin-secondary" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200">Recent Students</h2>
          <Link href="/students" className="text-xs text-unilorin-primary dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {students.map((student) => (
            <Link key={student._id} href={`/students/${student._id}`}
              className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-unilorin-primary transition-colors group">
              <div className="w-9 h-9 rounded-full bg-unilorin-primary dark:bg-blue-700 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">{getInitials(student.firstName, student.lastName)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{student.firstName} {student.lastName}</p>
                <p className="text-xs text-gray-400 truncate">{student.matricNumber || student.email}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-unilorin-primary flex-shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { data: usersData, isLoading } = useApi('/users?limit=5');
  const users = usersData?.data?.users || [];
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon={Users} label="Total Users" value={usersData?.count || 0} href="/admin/users" />
        <StatCard icon={CheckCircle} label="Active" value={users.filter((u) => u.isActive).length} color="text-green-500" />
        <StatCard icon={Award} label="Admins" value={users.filter((u) => u.role === 'admin').length} color="text-unilorin-secondary" />
      </div>

      <div>
        <h2 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <QuickAction href="/admin/users" icon={UserCog} label="Manage Users" description="Add, edit, deactivate accounts" />
          <QuickAction href="/admin/institutions" icon={Award} label="Institutions" description="Manage registered institutions" color="bg-purple-600" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-heading font-semibold text-gray-800 dark:text-gray-200">Recent Users</h2>
          <Link href="/admin/users" className="text-xs text-unilorin-primary dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user._id} className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${user.isActive ? 'bg-unilorin-primary dark:bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <span className="text-xs font-bold text-white">{getInitials(user.firstName, user.lastName)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-400 truncate">{user.email} · <span className="capitalize">{user.role}</span></p>
              </div>
              {!user.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 flex-shrink-0">Inactive</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const DASHBOARDS = {
  student: StudentDashboard,
  supervisor: SupervisorDashboard,
  coordinator: CoordinatorDashboard,
  admin: AdminDashboard,
};

const PAGE_TITLES = {
  student: 'Dashboard',
  supervisor: 'Supervisor Dashboard',
  coordinator: 'Coordinator Dashboard',
  admin: 'Admin Dashboard',
};

export default function DashboardPage() {
  const { query } = useRouter();
  const role = query.role;
  const DashboardComponent = DASHBOARDS[role];

  return (
    <>
      <Head><title>UniIlorin E-SIWES — {PAGE_TITLES[role] || 'Dashboard'}</title></Head>
      <AppLayout pageTitle={PAGE_TITLES[role] || 'Dashboard'} allowedRoles={[role]}>
        {DashboardComponent ? <DashboardComponent /> : <LoadingSpinner />}
      </AppLayout>
    </>
  );
}