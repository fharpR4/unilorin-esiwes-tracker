const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const submitApplication = asyncHandler(async (req, res, next) => {
  const existing = await Application.findOne({
    student: req.user._id,
    status: { $in: ['pending', 'approved'] },
  });
  if (existing) {
    return next(new ApiError(409, 'You already have a pending or approved SIWES application.'));
  }

  const application = await Application.create({
    ...req.body,
    student: req.user._id,
    institution: req.user.institution,
  });

  res.status(201).json({ success: true, message: 'Application submitted.', data: { application } });
});

const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ student: req.user._id })
    .populate('supervisor', 'firstName lastName email')
    .populate('institution', 'name acronym')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: applications.length, data: { applications } });
});

const getAllApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = { institution: req.user.institution };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Application.countDocuments(filter);
  const applications = await Application.find(filter)
    .populate('student', 'firstName lastName email matricNumber')
    .populate('supervisor', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true, count: total,
    page: parseInt(page), pages: Math.ceil(total / parseInt(limit)),
    data: { applications },
  });
});

const approveApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findOne({
    _id: req.params.id,
    institution: req.user.institution,
    status: 'pending',
  });
  if (!application) return next(new ApiError(404, 'Application not found.'));

  application.status = 'approved';
  application.coordinator = req.user._id;
  application.coordinatorComment = req.body.comment || '';
  application.approvedAt = new Date();
  await application.save();

  res.status(200).json({ success: true, message: 'Application approved.', data: { application } });
});

const rejectApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findOne({
    _id: req.params.id,
    institution: req.user.institution,
    status: 'pending',
  });
  if (!application) return next(new ApiError(404, 'Application not found.'));

  application.status = 'rejected';
  application.coordinator = req.user._id;
  application.coordinatorComment = req.body.reason || '';
  application.rejectedAt = new Date();
  await application.save();

  res.status(200).json({ success: true, message: 'Application rejected.', data: { application } });
});

module.exports = {
  submitApplication,
  getMyApplications,
  getAllApplications,
  approveApplication,
  rejectApplication,
};