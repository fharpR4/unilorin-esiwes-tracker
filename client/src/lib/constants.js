export const ROLES = {
  STUDENT: 'student',
  SUPERVISOR: 'supervisor',
  COORDINATOR: 'coordinator',
  ADMIN: 'admin',
};

export const LOG_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RESUBMITTED: 'resubmitted',
};

export const PROJECT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REVISION: 'revision_requested',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day',
};

export const LOG_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  resubmitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

export const PROJECT_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  revision_requested: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

export const ATTENDANCE_STATUS_COLORS = {
  present: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  late: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  absent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  half_day: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

export const LOG_STATUS_LABELS = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  resubmitted: 'Resubmitted',
};

export const PROJECT_STATUS_LABELS = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  revision_requested: 'Revision Requested',
};

export const ATTENDANCE_LABELS = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  half_day: 'Half Day',
};

export const NOTIFICATION_ICONS = {
  log_approved: '✓',
  log_rejected: '✗',
  log_resubmitted: '↻',
  application_approved: '✓',
  application_rejected: '✗',
  project_approved: '✓',
  project_rejected: '✗',
  attendance_reminder: '⏰',
  report_submitted: '📋',
  system: 'ℹ',
};

export const APP_NAME = 'UniIlorin E-SIWES Progress Tracker';
export const APP_VERSION = '2.0.0';
export const UNIVERSITY_NAME = 'University of Ilorin';
export const UNIVERSITY_ACRONYM = 'UNILORIN';

export const ROLE_DASHBOARD_MAP = {
  student: '/dashboard/student',
  supervisor: '/dashboard/supervisor',
  coordinator: '/dashboard/coordinator',
  admin: '/dashboard/admin',
};

export const ROLE_LABELS = {
  student: 'Student',
  supervisor: 'Supervisor',
  coordinator: 'Coordinator',
  admin: 'Administrator',
};

export const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

export const ACADEMIC_LEVELS = ['100','200','300','400','500','600'];