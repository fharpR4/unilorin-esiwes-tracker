const Log = require('../models/Log');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification, logActivity } = require('../utils/createNotification');

// @desc    Create a new daily log
// @route   POST /api/logs
// @access  Student
const createLog = asyncHandler(async (req, res, next) => {
  const {
    applicationId, dateOfActivity, dayNumber, title, description,
    skillsLearned, challenges, portraitImage, environmentImage, geolocation,
  } = req.body;

  const application = await Application.findOne({
    _id: applicationId,
    student: req.user._id,
    status: 'approved',
  });

  if (!application) {
    return next(new ApiError(404, 'Active approved SIWES application not found. You must have an approved application to submit logs.'));
  }

  // Prevent duplicate day numbers per application
  const existingLog = await Log.findOne({
    application: applicationId,
    student: req.user._id,
    dayNumber: parseInt(dayNumber),
  });

  if (existingLog) {
    return next(new ApiError(409, `A log entry for Day ${dayNumber} already exists for this application.`));
  }

  const log = await Log.create({
    student: req.user._id,
    application: applicationId,
    supervisor: application.supervisor,
    dateOfActivity,
    dayNumber: parseInt(dayNumber),
    title,
    description,
    skillsLearned: Array.isArray(skillsLearned) ? skillsLearned : [],
    challenges,
    portraitImage: { data: portraitImage, capturedAt: new Date() },
    environmentImage: { data: environmentImage, capturedAt: new Date() },
    geolocation: {
      type: 'Point',
      coordinates: geolocation.coordinates,
      accuracy: geolocation.accuracy || null,
      capturedAt: new Date(),
    },
    deviceInfo: {
      userAgent: req.headers['user-agent'] || '',
      platform: req.body.platform || '',
    },
  });

  // Notify the assigned supervisor
  await createNotification({
    recipientId: application.supervisor,
    type: 'log_submitted',
    title: 'New Log Entry Submitted',
    message: `${req.user.firstName} ${req.user.lastName} submitted Day ${dayNumber} log: "${title}". Please review.`,
    link: `/logs/${log._id}`,
    relatedId: log._id,
    relatedModel: 'Log',
  });

  logActivity({
    userId: req.user._id,
    action: 'LOG_SUBMITTED',
    entity: 'Log',
    entityId: log._id,
    ipAddress: req.ip,
  });

  // Return without image data in the list response for performance
  const populatedLog = await Log.findById(log._id)
    .select('-portraitImage.data -environmentImage.data')
    .populate('student', 'firstName lastName matricNumber')
    .populate('supervisor', 'firstName lastName email');

  res.status(201).json({
    success: true,
    message: 'Log submitted successfully. Your supervisor has been notified.',
    data: { log: populatedLog },
  });
});

// @desc    Get all logs for the authenticated student
// @route   GET /api/logs
// @access  Student
const getMyLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, applicationId } = req.query;

  const filter = { student: req.user._id };
  if (status) filter.status = status;
  if (applicationId) filter.application = applicationId;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Log.countDocuments(filter);

  const logs = await Log.find(filter)
    .select('-portraitImage.data -environmentImage.data')
    .populate('supervisor', 'firstName lastName email')
    .sort({ dateOfActivity: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: { logs },
  });
});

// @desc    Get single log by ID — ALWAYS includes images for all authorised roles
// @route   GET /api/logs/:id
// @access  Student (own), Supervisor (assigned), Coordinator, Admin
const getLogById = asyncHandler(async (req, res, next) => {
  const { role, _id } = req.user;

  // NO .select() exclusion here — images are always returned on the detail view
  const log = await Log.findById(req.params.id)
    .populate('student', 'firstName lastName email matricNumber courseOfStudy department level')
    .populate('supervisor', 'firstName lastName email phone')
    .populate('application', 'organizationName startDate expectedEndDate totalDaysRequired');

  if (!log) {
    return next(new ApiError(404, 'Log not found.'));
  }

  // Students can only view their own logs
  if (role === 'student' && log.student._id.toString() !== _id.toString()) {
    return next(new ApiError(403, 'You are not authorized to view this log.'));
  }

  // Supervisors can only view logs assigned to them
  if (role === 'supervisor' && log.supervisor?._id.toString() !== _id.toString()) {
    return next(new ApiError(403, 'This log is not assigned to you.'));
  }

  res.status(200).json({
    success: true,
    data: { log },
  });
});

// @desc    Get log images separately (for coordinator/admin — lightweight endpoint)
// @route   GET /api/logs/:id/images
// @access  Coordinator, Admin
const getLogImages = asyncHandler(async (req, res, next) => {
  const log = await Log.findById(req.params.id)
    .select('portraitImage environmentImage student supervisor');

  if (!log) {
    return next(new ApiError(404, 'Log not found.'));
  }

  // Coordinator and admin can view any log's images
  res.status(200).json({
    success: true,
    data: {
      portraitImage: log.portraitImage,
      environmentImage: log.environmentImage,
      studentId: log.student,
      supervisorId: log.supervisor,
    },
  });
});

// @desc    Update a pending or rejected log (resubmit)
// @route   PUT /api/logs/:id
// @access  Student (own)
const updateLog = asyncHandler(async (req, res, next) => {
  const log = await Log.findOne({ _id: req.params.id, student: req.user._id });

  if (!log) return next(new ApiError(404, 'Log not found.'));

  if (!['pending', 'rejected'].includes(log.status)) {
    return next(new ApiError(400, `Cannot edit a log with status '${log.status}'.`));
  }

  const allowed = ['title', 'description', 'skillsLearned', 'challenges', 'dateOfActivity', 'portraitImage', 'environmentImage', 'geolocation'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === 'portraitImage') {
        log.portraitImage = { data: req.body[field], capturedAt: new Date() };
      } else if (field === 'environmentImage') {
        log.environmentImage = { data: req.body[field], capturedAt: new Date() };
      } else if (field === 'geolocation') {
        log.geolocation = { type: 'Point', coordinates: req.body[field].coordinates, accuracy: req.body[field].accuracy || null, capturedAt: new Date() };
      } else {
        log[field] = req.body[field];
      }
    }
  });

  if (log.status === 'rejected') {
    log.status = 'resubmitted';
    log.resubmittedAt = new Date();

    // Notify supervisor on resubmission
    await createNotification({
      recipientId: log.supervisor,
      type: 'log_resubmitted',
      title: 'Log Resubmitted',
      message: `${req.user.firstName} ${req.user.lastName} resubmitted Day ${log.dayNumber} log: "${log.title}".`,
      link: `/logs/${log._id}`,
      relatedId: log._id,
      relatedModel: 'Log',
    });
  }

  await log.save();

  res.status(200).json({
    success: true,
    message: log.status === 'resubmitted' ? 'Log resubmitted. Supervisor notified.' : 'Log updated.',
    data: { log },
  });
});

// @desc    Delete a pending log
// @route   DELETE /api/logs/:id
// @access  Student (own)
const deleteLog = asyncHandler(async (req, res, next) => {
  const log = await Log.findOne({ _id: req.params.id, student: req.user._id });
  if (!log) return next(new ApiError(404, 'Log not found.'));
  if (log.status !== 'pending') return next(new ApiError(400, 'Only pending logs can be deleted.'));
  await log.deleteOne();
  res.status(200).json({ success: true, message: 'Log deleted.' });
});

// @desc    Approve a log
// @route   PATCH /api/logs/:id/approve
// @access  Supervisor
const approveLog = asyncHandler(async (req, res, next) => {
  const { comment } = req.body;
  const log = await Log.findOne({ _id: req.params.id, supervisor: req.user._id });
  if (!log) return next(new ApiError(404, 'Log not found or not assigned to you.'));
  if (!['pending', 'resubmitted'].includes(log.status)) {
    return next(new ApiError(400, `Log is already '${log.status}'.`));
  }

  log.status = 'approved';
  log.supervisorComment = comment || '';
  log.approvedAt = new Date();
  await log.save();

  // Notify student
  await createNotification({
    recipientId: log.student,
    type: 'log_approved',
    title: 'Log Approved',
    message: `Your Day ${log.dayNumber} log "${log.title}" has been approved by your supervisor.`,
    link: `/logs/${log._id}`,
    relatedId: log._id,
    relatedModel: 'Log',
  });

  logActivity({ userId: req.user._id, action: 'LOG_APPROVED', entity: 'Log', entityId: log._id });

  res.status(200).json({ success: true, message: 'Log approved. Student notified.', data: { log } });
});

// @desc    Reject a log
// @route   PATCH /api/logs/:id/reject
// @access  Supervisor
const rejectLog = asyncHandler(async (req, res, next) => {
  const { rejectionReason } = req.body;
  const log = await Log.findOne({ _id: req.params.id, supervisor: req.user._id });
  if (!log) return next(new ApiError(404, 'Log not found or not assigned to you.'));
  if (!['pending', 'resubmitted'].includes(log.status)) {
    return next(new ApiError(400, `Log is already '${log.status}'.`));
  }

  log.status = 'rejected';
  log.rejectionReason = rejectionReason;
  log.supervisorComment = '';
  await log.save();

  // Notify student
  await createNotification({
    recipientId: log.student,
    type: 'log_rejected',
    title: 'Log Rejected',
    message: `Your Day ${log.dayNumber} log "${log.title}" was rejected. Reason: ${rejectionReason}`,
    link: `/logs/${log._id}`,
    relatedId: log._id,
    relatedModel: 'Log',
  });

  logActivity({ userId: req.user._id, action: 'LOG_REJECTED', entity: 'Log', entityId: log._id });

  res.status(200).json({ success: true, message: 'Log rejected. Student notified.', data: { log } });
});

// @desc    Get pending logs for supervisor queue
// @route   GET /api/logs/pending
// @access  Supervisor
const getPendingLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { supervisor: req.user._id, status: { $in: ['pending', 'resubmitted'] } };
  const total = await Log.countDocuments(filter);
  const logs = await Log.find(filter)
    .select('-portraitImage.data -environmentImage.data')
    .populate('student', 'firstName lastName email matricNumber')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({ success: true, count: total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), data: { logs } });
});

// @desc    Get all logs for a specific student (coordinator/admin)
// @route   GET /api/logs/student/:studentId
// @access  Coordinator, Admin
const getStudentLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, status } = req.query;
  const filter = { student: req.params.studentId };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Log.countDocuments(filter);
  const logs = await Log.find(filter)
    .select('-portraitImage.data -environmentImage.data')
    .populate('supervisor', 'firstName lastName email')
    .populate('application', 'organizationName')
    .sort({ dateOfActivity: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({ success: true, count: total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), data: { logs } });
});

// @desc    Get nearby logs
// @route   GET /api/logs/nearby
// @access  Coordinator, Admin
const getNearbyLogs = asyncHandler(async (req, res, next) => {
  const { lat, lng, radius = 5000 } = req.query;
  if (!lat || !lng) return next(new ApiError(400, 'lat and lng are required.'));

  const logs = await Log.find({
    geolocation: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseInt(radius),
      },
    },
  })
    .select('-portraitImage.data -environmentImage.data')
    .populate('student', 'firstName lastName matricNumber')
    .limit(100);

  res.status(200).json({ success: true, count: logs.length, data: { logs } });
});

module.exports = {
  createLog,
  getMyLogs,
  getLogById,
  getLogImages,
  updateLog,
  deleteLog,
  approveLog,
  rejectLog,
  getPendingLogs,
  getStudentLogs,
  getNearbyLogs,
};