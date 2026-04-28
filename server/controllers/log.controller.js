const Log = require('../models/Log');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new daily log
// @route   POST /api/logs
// @access  Student
const createLog = asyncHandler(async (req, res, next) => {
  const {
    applicationId,
    dateOfActivity,
    dayNumber,
    title,
    description,
    skillsLearned,
    challenges,
    portraitImage,
    environmentImage,
    geolocation,
  } = req.body;

  // Verify application belongs to this student and is approved
  const application = await Application.findOne({
    _id: applicationId,
    student: req.user._id,
    status: 'approved',
  });

  if (!application) {
    return next(new ApiError(404, 'Active approved SIWES application not found. You must have an approved application before submitting logs.'));
  }

  // Prevent duplicate day numbers per application
  const existingLog = await Log.findOne({
    application: applicationId,
    student: req.user._id,
    dayNumber: parseInt(dayNumber),
  });

  if (existingLog) {
    return next(new ApiError(409, `A log for Day ${dayNumber} already exists for this application.`));
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
    portraitImage: {
      data: portraitImage,
      capturedAt: new Date(),
    },
    environmentImage: {
      data: environmentImage,
      capturedAt: new Date(),
    },
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

  const populatedLog = await Log.findById(log._id)
    .select('-portraitImage.data -environmentImage.data')
    .populate('student', 'firstName lastName matricNumber')
    .populate('supervisor', 'firstName lastName email');

  res.status(201).json({
    success: true,
    message: 'Log submitted successfully. Awaiting supervisor approval.',
    data: { log: populatedLog },
  });
});

// @desc    Get all logs for the authenticated student
// @route   GET /api/logs
// @access  Student
const getMyLogs = asyncHandler(async (req, res, next) => {
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

// @desc    Get single log by ID
// @route   GET /api/logs/:id
// @access  Student (own), Supervisor (assigned), Coordinator, Admin
const getLogById = asyncHandler(async (req, res, next) => {
  const log = await Log.findById(req.params.id)
    .populate('student', 'firstName lastName email matricNumber courseOfStudy')
    .populate('supervisor', 'firstName lastName email')
    .populate('application', 'organizationName startDate expectedEndDate');

  if (!log) {
    return next(new ApiError(404, 'Log not found.'));
  }

  const { role, _id } = req.user;

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

// @desc    Update a pending or rejected log (resubmit)
// @route   PUT /api/logs/:id
// @access  Student (own)
const updateLog = asyncHandler(async (req, res, next) => {
  const log = await Log.findOne({ _id: req.params.id, student: req.user._id });

  if (!log) {
    return next(new ApiError(404, 'Log not found.'));
  }

  if (!['pending', 'rejected'].includes(log.status)) {
    return next(new ApiError(400, `Cannot edit a log with status '${log.status}'. Only pending or rejected logs can be updated.`));
  }

  const allowedFields = [
    'title', 'description', 'skillsLearned', 'challenges',
    'dateOfActivity', 'portraitImage', 'environmentImage', 'geolocation',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === 'portraitImage') {
        log.portraitImage = { data: req.body[field], capturedAt: new Date() };
      } else if (field === 'environmentImage') {
        log.environmentImage = { data: req.body[field], capturedAt: new Date() };
      } else if (field === 'geolocation') {
        log.geolocation = {
          type: 'Point',
          coordinates: req.body[field].coordinates,
          accuracy: req.body[field].accuracy || null,
          capturedAt: new Date(),
        };
      } else {
        log[field] = req.body[field];
      }
    }
  });

  if (log.status === 'rejected') {
    log.status = 'resubmitted';
    log.resubmittedAt = new Date();
  }

  await log.save();

  res.status(200).json({
    success: true,
    message: log.status === 'resubmitted'
      ? 'Log resubmitted successfully. Awaiting supervisor review.'
      : 'Log updated successfully.',
    data: { log },
  });
});

// @desc    Delete a pending log
// @route   DELETE /api/logs/:id
// @access  Student (own)
const deleteLog = asyncHandler(async (req, res, next) => {
  const log = await Log.findOne({ _id: req.params.id, student: req.user._id });

  if (!log) {
    return next(new ApiError(404, 'Log not found.'));
  }

  if (log.status !== 'pending') {
    return next(new ApiError(400, `Cannot delete a log with status '${log.status}'. Only pending logs can be deleted.`));
  }

  await log.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Log deleted successfully.',
  });
});

// @desc    Approve a log
// @route   PATCH /api/logs/:id/approve
// @access  Supervisor
const approveLog = asyncHandler(async (req, res, next) => {
  const { comment } = req.body;

  const log = await Log.findOne({
    _id: req.params.id,
    supervisor: req.user._id,
  });

  if (!log) {
    return next(new ApiError(404, 'Log not found or not assigned to you.'));
  }

  if (!['pending', 'resubmitted'].includes(log.status)) {
    return next(new ApiError(400, `Log is already '${log.status}'. Only pending or resubmitted logs can be approved.`));
  }

  log.status = 'approved';
  log.supervisorComment = comment || '';
  log.approvedAt = new Date();
  await log.save();

  res.status(200).json({
    success: true,
    message: 'Log approved successfully.',
    data: { log },
  });
});

// @desc    Reject a log
// @route   PATCH /api/logs/:id/reject
// @access  Supervisor
const rejectLog = asyncHandler(async (req, res, next) => {
  const { rejectionReason } = req.body;

  const log = await Log.findOne({
    _id: req.params.id,
    supervisor: req.user._id,
  });

  if (!log) {
    return next(new ApiError(404, 'Log not found or not assigned to you.'));
  }

  if (!['pending', 'resubmitted'].includes(log.status)) {
    return next(new ApiError(400, `Log is already '${log.status}'. Only pending or resubmitted logs can be rejected.`));
  }

  log.status = 'rejected';
  log.rejectionReason = rejectionReason;
  log.supervisorComment = '';
  await log.save();

  res.status(200).json({
    success: true,
    message: 'Log rejected. The student will be notified to resubmit.',
    data: { log },
  });
});

// @desc    Get pending logs for supervisor's approval queue
// @route   GET /api/logs/pending
// @access  Supervisor
const getPendingLogs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {
    supervisor: req.user._id,
    status: { $in: ['pending', 'resubmitted'] },
  };

  const total = await Log.countDocuments(filter);
  const logs = await Log.find(filter)
    .select('-portraitImage.data -environmentImage.data')
    .populate('student', 'firstName lastName email matricNumber')
    .sort({ createdAt: 1 })
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

// @desc    Get all logs for a specific student (coordinator view)
// @route   GET /api/logs/student/:studentId
// @access  Coordinator, Admin
const getStudentLogs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 50, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { student: req.params.studentId };
  if (status) filter.status = status;

  const total = await Log.countDocuments(filter);
  const logs = await Log.find(filter)
    .select('-portraitImage.data -environmentImage.data')
    .populate('supervisor', 'firstName lastName email')
    .populate('application', 'organizationName')
    .sort({ dateOfActivity: 1 })
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

// @desc    Get logs with images for a specific log (coordinator/admin)
// @route   GET /api/logs/:id/images
// @access  Coordinator, Admin
const getLogImages = asyncHandler(async (req, res, next) => {
  const log = await Log.findById(req.params.id)
    .select('portraitImage environmentImage student geolocation dateOfActivity dayNumber')
    .populate('student', 'firstName lastName matricNumber');

  if (!log) {
    return next(new ApiError(404, 'Log not found.'));
  }

  res.status(200).json({
    success: true,
    data: { log },
  });
});

// @desc    Find logs within a geographic radius
// @route   GET /api/logs/nearby?lat=8.49&lng=4.67&radius=5000
// @access  Coordinator, Admin
const getNearbyLogs = asyncHandler(async (req, res, next) => {
  const { lat, lng, radius = 5000 } = req.query;

  if (!lat || !lng) {
    return next(new ApiError(400, 'Latitude (lat) and longitude (lng) query parameters are required.'));
  }

  const logs = await Log.find({
    geolocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseInt(radius),
      },
    },
  })
    .select('-portraitImage.data -environmentImage.data')
    .populate('student', 'firstName lastName matricNumber')
    .limit(100);

  res.status(200).json({
    success: true,
    count: logs.length,
    data: { logs },
  });
});

module.exports = {
  createLog,
  getMyLogs,
  getLogById,
  updateLog,
  deleteLog,
  approveLog,
  rejectLog,
  getPendingLogs,
  getStudentLogs,
  getLogImages,
  getNearbyLogs,
};