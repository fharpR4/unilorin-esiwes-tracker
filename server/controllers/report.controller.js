const Report = require('../models/Report');
const Attendance = require('../models/Attendance');
const Log = require('../models/Log');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../utils/createNotification');

const submitReport = asyncHandler(async (req, res, next) => {
  const { weekNumber, startDate, endDate, summary, accomplishments, nextWeekPlan } = req.body;

  const application = await Application.findOne({ student: req.user._id, status: 'approved' });
  if (!application) return next(new ApiError(404, 'No approved application found.'));

  const existing = await Report.findOne({ student: req.user._id, weekNumber });
  if (existing) return next(new ApiError(409, `Week ${weekNumber} report already submitted.`));

  const start = new Date(startDate);
  const end = new Date(endDate);

  const [attendanceRecords, logs] = await Promise.all([
    Attendance.find({ student: req.user._id, date: { $gte: start, $lte: end } }),
    Log.countDocuments({ student: req.user._id, dateOfActivity: { $gte: start, $lte: end } }),
  ]);

  const report = await Report.create({
    student: req.user._id,
    application: application._id,
    supervisor: application.supervisor,
    weekNumber,
    startDate,
    endDate,
    summary,
    accomplishments: accomplishments || [],
    nextWeekPlan,
    daysAttended: attendanceRecords.length,
    logsCount: logs,
    status: 'submitted',
    submittedAt: new Date(),
  });

  await createNotification({
    recipientId: application.supervisor,
    type: 'report_submitted',
    title: 'Weekly Report Submitted',
    message: `${req.user.firstName} ${req.user.lastName} submitted their Week ${weekNumber} report.`,
    link: `/reports/${report._id}`,
    relatedId: report._id,
    relatedModel: 'Report',
  });

  res.status(201).json({ success: true, message: 'Weekly report submitted.', data: { report } });
});

const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ student: req.user._id })
    .populate('supervisor', 'firstName lastName')
    .sort({ weekNumber: -1 });
  res.status(200).json({ success: true, count: reports.length, data: { reports } });
});

const getStudentReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ student: req.params.studentId })
    .sort({ weekNumber: -1 });
  res.status(200).json({ success: true, count: reports.length, data: { reports } });
});

const getPendingReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ supervisor: req.user._id, status: 'submitted' })
    .populate('student', 'firstName lastName email matricNumber')
    .sort({ createdAt: 1 });
  res.status(200).json({ success: true, count: reports.length, data: { reports } });
});

const reviewReport = asyncHandler(async (req, res, next) => {
  const report = await Report.findOne({ _id: req.params.id, supervisor: req.user._id });
  if (!report) return next(new ApiError(404, 'Report not found.'));
  report.supervisorFeedback = req.body.feedback || '';
  report.status = 'reviewed';
  await report.save();
  res.status(200).json({ success: true, message: 'Report reviewed.', data: { report } });
});

module.exports = { submitReport, getMyReports, getStudentReports, getPendingReports, reviewReport };