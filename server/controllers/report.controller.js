const Report = require('../models/Report');
const Attendance = require('../models/Attendance');
const Log = require('../models/Log');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../utils/createNotification');

// @desc    Student submits weekly report
// @route   POST /api/reports
// @access  Student
const submitReport = asyncHandler(async (req, res, next) => {
  const { weekNumber, startDate, endDate, summary, accomplishments, nextWeekPlan } = req.body;

  if (!summary || summary.trim().length < 100) {
    return next(new ApiError(400, 'Weekly summary must be at least 100 characters.'));
  }

  const application = await Application.findOne({
    student: req.user._id,
    status: 'approved',
  });
  if (!application) {
    return next(new ApiError(404, 'No approved SIWES application found.'));
  }

  const existing = await Report.findOne({ student: req.user._id, weekNumber: parseInt(weekNumber) });
  if (existing) {
    return next(new ApiError(409, `Week ${weekNumber} report already submitted.`));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const [attendanceRecords, logsCount] = await Promise.all([
    Attendance.countDocuments({ student: req.user._id, date: { $gte: start, $lte: end } }),
    Log.countDocuments({ student: req.user._id, dateOfActivity: { $gte: start, $lte: end } }),
  ]);

  const report = await Report.create({
    student: req.user._id,
    application: application._id,
    supervisor: application.supervisor,
    weekNumber: parseInt(weekNumber),
    startDate,
    endDate,
    summary: summary.trim(),
    accomplishments: Array.isArray(accomplishments) ? accomplishments.filter((a) => a?.trim()) : [],
    nextWeekPlan: nextWeekPlan?.trim() || '',
    daysAttended: attendanceRecords,
    logsCount,
    status: 'submitted',
    submittedAt: new Date(),
  });

  await createNotification({
    recipientId: application.supervisor,
    type: 'report_submitted',
    title: 'Weekly Report Submitted',
    message: `${req.user.firstName} ${req.user.lastName} submitted their Week ${weekNumber} report (${attendanceRecords} days attended, ${logsCount} logs submitted).`,
    link: `/reports/pending`,
    relatedId: report._id,
    relatedModel: 'Report',
  });

  res.status(201).json({
    success: true,
    message: 'Weekly report submitted. Your supervisor has been notified.',
    data: { report },
  });
});

// @desc    Get student's own reports
// @route   GET /api/reports/mine
// @access  Student
const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ student: req.user._id })
    .populate('supervisor', 'firstName lastName title')
    .sort({ weekNumber: -1 });

  res.status(200).json({
    success: true,
    count: reports.length,
    data: { reports },
  });
});

// @desc    Get student reports (coordinator/admin)
// @route   GET /api/reports/student/:studentId
// @access  Coordinator, Admin
const getStudentReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ student: req.params.studentId })
    .populate('supervisor', 'firstName lastName title')
    .sort({ weekNumber: -1 });

  res.status(200).json({
    success: true,
    count: reports.length,
    data: { reports },
  });
});

// @desc    Get pending reports for supervisor
// @route   GET /api/reports/pending
// @access  Supervisor
const getPendingReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({
    supervisor: req.user._id,
    status: 'submitted',
  })
    .populate('student', 'firstName lastName email matricNumber')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    count: reports.length,
    data: { reports },
  });
});

// @desc    Supervisor reviews a report
// @route   PATCH /api/reports/:id/review
// @access  Supervisor
const reviewReport = asyncHandler(async (req, res, next) => {
  const report = await Report.findOne({
    _id: req.params.id,
    supervisor: req.user._id,
  });
  if (!report) return next(new ApiError(404, 'Report not found or not assigned to you.'));
  if (report.status === 'reviewed') return next(new ApiError(400, 'Report has already been reviewed.'));

  report.supervisorFeedback = req.body.feedback?.trim() || '';
  report.status = 'reviewed';
  await report.save();

  await createNotification({
    recipientId: report.student,
    type: 'system',
    title: `Week ${report.weekNumber} Report Reviewed`,
    message: `Your Week ${report.weekNumber} report has been reviewed by your supervisor.${report.supervisorFeedback ? ` Feedback: ${report.supervisorFeedback}` : ''}`,
    link: `/reports`,
    relatedId: report._id,
    relatedModel: 'Report',
  });

  res.status(200).json({
    success: true,
    message: 'Report reviewed. Student has been notified.',
    data: { report },
  });
});

module.exports = {
  submitReport, getMyReports, getStudentReports,
  getPendingReports, reviewReport,
};