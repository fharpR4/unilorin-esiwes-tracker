const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../utils/createNotification');

// @desc    Update own profile
// @route   PUT /api/profile
// @access  Private (all roles)
const updateProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = [
    'firstName', 'lastName', 'phone', 'courseOfStudy',
    'matricNumber', 'department', 'level',
  ];

  const user = await User.findById(req.user._id);
  if (!user) return next(new ApiError(404, 'User not found.'));

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  await user.save();

  logActivity({
    userId: req.user._id,
    action: 'PROFILE_UPDATED',
    entity: 'User',
    entityId: req.user._id,
    ipAddress: req.ip,
  });

  res.status(200).json({ success: true, message: 'Profile updated successfully.', data: { user } });
});

// @desc    Change own password
// @route   PUT /api/profile/change-password
// @access  Private (all roles)
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ApiError(400, 'Current password and new password are required.'));
  }
  if (newPassword.length < 6) {
    return next(new ApiError(400, 'New password must be at least 6 characters.'));
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) return next(new ApiError(404, 'User not found.'));

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return next(new ApiError(401, 'Current password is incorrect.'));

  user.password = newPassword;
  await user.save();

  logActivity({
    userId: req.user._id,
    action: 'PASSWORD_CHANGED',
    entity: 'User',
    entityId: req.user._id,
    ipAddress: req.ip,
  });

  res.status(200).json({ success: true, message: 'Password changed successfully.' });
});

// @desc    Get analytics for the current user
// @route   GET /api/profile/analytics
// @access  Student
const getStudentAnalytics = asyncHandler(async (req, res) => {
  const Log = require('../models/Log');
  const Attendance = require('../models/Attendance');
  const Application = require('../models/Application');

  const application = await Application.findOne({ student: req.user._id, status: 'approved' });

  const [logs, attendance] = await Promise.all([
    Log.find({ student: req.user._id }).select('status dateOfActivity createdAt'),
    Attendance.find({ student: req.user._id }).select('date status hoursWorked'),
  ]);

  const totalLogs = logs.length;
  const approvedLogs = logs.filter((l) => l.status === 'approved').length;
  const pendingLogs = logs.filter((l) => l.status === 'pending').length;
  const rejectedLogs = logs.filter((l) => l.status === 'rejected').length;
  const totalAttendance = attendance.length;
  const totalHours = attendance.reduce((s, a) => s + (a.hoursWorked || 0), 0);
  const progress = application
    ? Math.min(Math.round((approvedLogs / application.totalDaysRequired) * 100), 100)
    : 0;

  // Build heatmap data — last 90 days
  const heatmap = {};
  logs.forEach((log) => {
    const key = new Date(log.dateOfActivity).toISOString().split('T')[0];
    heatmap[key] = (heatmap[key] || 0) + 1;
  });

  // Weekly trend — last 12 weeks
  const weeklyTrend = [];
  for (let w = 11; w >= 0; w--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - w * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekLogs = logs.filter((l) => {
      const d = new Date(l.dateOfActivity);
      return d >= weekStart && d <= weekEnd;
    });
    weeklyTrend.push({
      week: weekStart.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
      logs: weekLogs.length,
      approved: weekLogs.filter((l) => l.status === 'approved').length,
    });
  }

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalLogs,
        approvedLogs,
        pendingLogs,
        rejectedLogs,
        totalAttendance,
        totalHours: parseFloat(totalHours.toFixed(2)),
        progress,
        totalDaysRequired: application?.totalDaysRequired || 90,
      },
      heatmap,
      weeklyTrend,
    },
  });
});

// @desc    Get coordinator analytics
// @route   GET /api/profile/coordinator-analytics
// @access  Coordinator
const getCoordinatorAnalytics = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const Log = require('../models/Log');
  const Application = require('../models/Application');

  const [studentCount, appCount, logCount, pendingLogs, approvedLogs] = await Promise.all([
    User.countDocuments({ role: 'student', institution: req.user.institution, isActive: true }),
    Application.countDocuments({ institution: req.user.institution }),
    Log.countDocuments(),
    Log.countDocuments({ status: 'pending' }),
    Log.countDocuments({ status: 'approved' }),
  ]);

  const approvalRate = logCount > 0 ? Math.round((approvedLogs / logCount) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      studentCount,
      appCount,
      logCount,
      pendingLogs,
      approvedLogs,
      approvalRate,
    },
  });
});

module.exports = { updateProfile, changePassword, getStudentAnalytics, getCoordinatorAnalytics };