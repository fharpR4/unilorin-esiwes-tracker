const Attendance = require('../models/Attendance');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification, logActivity } = require('../utils/createNotification');

// @desc    Check in for the day
// @route   POST /api/attendance/checkin
// @access  Student
const checkIn = asyncHandler(async (req, res, next) => {
  const { geolocation, dayNumber } = req.body;

  const application = await Application.findOne({
    student: req.user._id,
    status: 'approved',
  });
  if (!application) {
    return next(new ApiError(404, 'No approved SIWES application found.'));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await Attendance.findOne({
    student: req.user._id,
    date: { $gte: today, $lt: tomorrow },
  });

  if (existing && existing.checkIn?.time) {
    return next(new ApiError(409, 'You have already checked in today.'));
  }

  let attendance;
  if (existing) {
    existing.checkIn = { time: new Date(), geolocation };
    attendance = await existing.save();
  } else {
    attendance = await Attendance.create({
      student: req.user._id,
      application: application._id,
      date: new Date(),
      dayNumber: dayNumber || 1,
      checkIn: { time: new Date(), geolocation },
    });
  }

  logActivity({
    userId: req.user._id,
    action: 'ATTENDANCE_CHECK_IN',
    entity: 'Attendance',
    entityId: attendance._id,
    ipAddress: req.ip,
  });

  res.status(200).json({
    success: true,
    message: 'Checked in successfully.',
    data: { attendance },
  });
});

// @desc    Check out for the day
// @route   POST /api/attendance/checkout
// @access  Student
const checkOut = asyncHandler(async (req, res, next) => {
  const { geolocation } = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const attendance = await Attendance.findOne({
    student: req.user._id,
    date: { $gte: today, $lt: tomorrow },
  });

  if (!attendance) {
    return next(new ApiError(404, 'No check-in record found for today. Please check in first.'));
  }
  if (!attendance.checkIn?.time) {
    return next(new ApiError(400, 'You must check in before checking out.'));
  }
  if (attendance.checkOut?.time) {
    return next(new ApiError(409, 'You have already checked out today.'));
  }

  attendance.checkOut = { time: new Date(), geolocation };
  await attendance.save();

  logActivity({
    userId: req.user._id,
    action: 'ATTENDANCE_CHECK_OUT',
    entity: 'Attendance',
    entityId: attendance._id,
  });

  res.status(200).json({
    success: true,
    message: `Checked out successfully. Hours worked today: ${attendance.hoursWorked}h`,
    data: { attendance },
  });
});

// @desc    Get today's attendance status
// @route   GET /api/attendance/today
// @access  Student
const getTodayAttendance = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const attendance = await Attendance.findOne({
    student: req.user._id,
    date: { $gte: today, $lt: tomorrow },
  });

  res.status(200).json({
    success: true,
    data: { attendance },
  });
});

// @desc    Get attendance history for student
// @route   GET /api/attendance
// @access  Student
const getMyAttendance = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const total = await Attendance.countDocuments({ student: req.user._id });
  const records = await Attendance.find({ student: req.user._id })
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
  const presentDays = records.filter((r) => ['present', 'late'].includes(r.status)).length;

  res.status(200).json({
    success: true,
    count: total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: {
      records,
      stats: {
        totalDays: total,
        presentDays,
        totalHours: parseFloat(totalHours.toFixed(2)),
        averageHours: total > 0 ? parseFloat((totalHours / total).toFixed(2)) : 0,
      },
    },
  });
});

// @desc    Get attendance for a specific student (coordinator/admin)
// @route   GET /api/attendance/student/:studentId
// @access  Coordinator, Admin
const getStudentAttendance = asyncHandler(async (req, res) => {
  const records = await Attendance.find({ student: req.params.studentId })
    .sort({ date: -1 });

  const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);

  res.status(200).json({
    success: true,
    count: records.length,
    data: {
      records,
      stats: {
        totalDays: records.length,
        presentDays: records.filter((r) => ['present', 'late'].includes(r.status)).length,
        totalHours: parseFloat(totalHours.toFixed(2)),
      },
    },
  });
});

module.exports = { checkIn, checkOut, getTodayAttendance, getMyAttendance, getStudentAttendance };