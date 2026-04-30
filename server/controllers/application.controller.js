const Application = require('../models/Application');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../utils/createNotification');

// @desc    Student submits a SIWES application
// @route   POST /api/applications
// @access  Student
const submitApplication = asyncHandler(async (req, res, next) => {
  // Check for existing active application
  const existing = await Application.findOne({
    student: req.user._id,
    status: { $in: ['pending', 'approved'] },
  });
  if (existing) {
    return next(new ApiError(409, 'You already have a pending or approved SIWES application. You cannot submit another until the current one is completed or rejected.'));
  }

  const {
    organizationName,
    organizationAddress,
    startDate,
    expectedEndDate,
    totalDaysRequired,
    supervisor,
  } = req.body;

  if (!supervisor) {
    return next(new ApiError(400, 'Please select a supervisor for your application.'));
  }

  // Verify supervisor exists
  const supervisorUser = await User.findOne({ _id: supervisor, role: 'supervisor', isActive: true });
  if (!supervisorUser) {
    return next(new ApiError(404, 'Selected supervisor not found. Please select a valid supervisor.'));
  }

  const application = await Application.create({
    student: req.user._id,
    institution: req.user.institution,
    supervisor,
    organizationName,
    organizationAddress,
    startDate,
    expectedEndDate,
    totalDaysRequired: totalDaysRequired || 90,
    allowExceedDays: true,
  });

  // Notify supervisor
  await createNotification({
    recipientId: supervisor,
    type: 'application_approved',
    title: 'New SIWES Application',
    message: `${req.user.firstName} ${req.user.lastName} has submitted a SIWES application and selected you as supervisor. Training at: ${organizationName}.`,
    link: `/dashboard/supervisor`,
    relatedId: application._id,
    relatedModel: 'Application',
  });

  res.status(201).json({
    success: true,
    message: 'SIWES application submitted successfully. Awaiting coordinator approval.',
    data: { application },
  });
});

// @desc    Student gets own applications
// @route   GET /api/applications/mine
// @access  Student
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ student: req.user._id })
    .populate('supervisor', 'firstName lastName email phone title supervisorDepartment supervisorInstitution')
    .populate('institution', 'name acronym')
    .populate('coordinator', 'firstName lastName email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: applications.length,
    data: { applications },
  });
});

// @desc    Coordinator/Admin gets all applications
// @route   GET /api/applications
// @access  Coordinator, Admin
const getAllApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const filter = {};

  // Coordinators only see their institution's applications
  if (req.user.role === 'coordinator' && req.user.institution) {
    filter.institution = req.user.institution;
  }

  if (status) filter.status = status;

  if (search) {
    // Search by student name — requires joining, so we do a lookup
    const students = await User.find({
      role: 'student',
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { matricNumber: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    filter.student = { $in: students.map((s) => s._id) };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Application.countDocuments(filter);
  const applications = await Application.find(filter)
    .populate('student', 'firstName lastName email matricNumber department level courseOfStudy')
    .populate('supervisor', 'firstName lastName email title supervisorDepartment')
    .populate('institution', 'name acronym')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: { applications },
  });
});

// @desc    Coordinator approves application
// @route   PATCH /api/applications/:id/approve
// @access  Coordinator, Admin
const approveApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findOne({
    _id: req.params.id,
    status: 'pending',
  });
  if (!application) return next(new ApiError(404, 'Pending application not found.'));

  application.status = 'approved';
  application.coordinator = req.user._id;
  application.coordinatorComment = req.body.comment || '';
  application.approvedAt = new Date();
  await application.save();

  // Notify student
  await createNotification({
    recipientId: application.student,
    type: 'application_approved',
    title: 'SIWES Application Approved!',
    message: `Your SIWES application for ${application.organizationName} has been approved. You can now submit daily logs and mark attendance.`,
    link: '/applications',
    relatedId: application._id,
    relatedModel: 'Application',
  });

  res.status(200).json({
    success: true,
    message: 'Application approved. Student has been notified.',
    data: { application },
  });
});

// @desc    Coordinator rejects application
// @route   PATCH /api/applications/:id/reject
// @access  Coordinator, Admin
const rejectApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findOne({
    _id: req.params.id,
    status: 'pending',
  });
  if (!application) return next(new ApiError(404, 'Pending application not found.'));

  if (!req.body.reason) {
    return next(new ApiError(400, 'A rejection reason is required.'));
  }

  application.status = 'rejected';
  application.coordinator = req.user._id;
  application.coordinatorComment = req.body.reason;
  application.rejectedAt = new Date();
  await application.save();

  // Notify student
  await createNotification({
    recipientId: application.student,
    type: 'application_rejected',
    title: 'SIWES Application Rejected',
    message: `Your SIWES application for ${application.organizationName} was rejected. Reason: ${req.body.reason}`,
    link: '/applications',
    relatedId: application._id,
    relatedModel: 'Application',
  });

  res.status(200).json({
    success: true,
    message: 'Application rejected. Student has been notified.',
    data: { application },
  });
});

module.exports = {
  submitApplication,
  getMyApplications,
  getAllApplications,
  approveApplication,
  rejectApplication,
};