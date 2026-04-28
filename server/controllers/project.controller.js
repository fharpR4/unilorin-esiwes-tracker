const Project = require('../models/Project');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification, logActivity } = require('../utils/createNotification');

// @desc    Submit a project title
// @route   POST /api/projects
// @access  Student
const submitProject = asyncHandler(async (req, res, next) => {
  const { title, description, objectives, techStack } = req.body;

  const application = await Application.findOne({
    student: req.user._id,
    status: 'approved',
  });
  if (!application) {
    return next(new ApiError(404, 'You need an approved SIWES application to submit a project title.'));
  }

  const existing = await Project.findOne({
    student: req.user._id,
    application: application._id,
    status: { $in: ['pending', 'approved'] },
  });
  if (existing) {
    return next(new ApiError(409, 'You already have a pending or approved project title. Update that one instead.'));
  }

  const project = await Project.create({
    student: req.user._id,
    application: application._id,
    supervisor: application.supervisor,
    title,
    description,
    objectives: objectives || [],
    techStack: techStack || [],
  });

  // Notify supervisor
  await createNotification({
    recipientId: application.supervisor,
    type: 'log_resubmitted',
    title: 'New Project Title Submitted',
    message: `${req.user.firstName} ${req.user.lastName} submitted a project title for your review: "${title}"`,
    link: `/projects/${project._id}`,
    relatedId: project._id,
    relatedModel: 'Project',
  });

  logActivity({ userId: req.user._id, action: 'PROJECT_SUBMITTED', entity: 'Project', entityId: project._id });

  res.status(201).json({
    success: true,
    message: 'Project title submitted for supervisor approval.',
    data: { project },
  });
});

// @desc    Get student's own project
// @route   GET /api/projects/mine
// @access  Student
const getMyProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ student: req.user._id })
    .sort({ createdAt: -1 })
    .populate('supervisor', 'firstName lastName email');

  res.status(200).json({ success: true, data: { project } });
});

// @desc    Update pending/rejected project
// @route   PUT /api/projects/:id
// @access  Student
const updateProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findOne({ _id: req.params.id, student: req.user._id });
  if (!project) return next(new ApiError(404, 'Project not found.'));
  if (project.status === 'approved') {
    return next(new ApiError(400, 'Cannot edit an approved project title.'));
  }

  const { title, description, objectives, techStack } = req.body;
  if (title) project.title = title;
  if (description) project.description = description;
  if (objectives) project.objectives = objectives;
  if (techStack) project.techStack = techStack;
  if (project.status === 'rejected' || project.status === 'revision_requested') {
    project.status = 'pending';
  }

  await project.save();
  res.status(200).json({ success: true, message: 'Project updated and resubmitted.', data: { project } });
});

// @desc    Get all pending projects for supervisor
// @route   GET /api/projects/pending
// @access  Supervisor
const getPendingProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ supervisor: req.user._id, status: 'pending' })
    .populate('student', 'firstName lastName email matricNumber')
    .sort({ createdAt: 1 });

  res.status(200).json({ success: true, count: projects.length, data: { projects } });
});

// @desc    Approve project title
// @route   PATCH /api/projects/:id/approve
// @access  Supervisor
const approveProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findOne({ _id: req.params.id, supervisor: req.user._id });
  if (!project) return next(new ApiError(404, 'Project not found or not assigned to you.'));

  project.status = 'approved';
  project.supervisorComment = req.body.comment || '';
  project.approvedAt = new Date();
  await project.save();

  await createNotification({
    recipientId: project.student,
    type: 'project_approved',
    title: 'Project Title Approved',
    message: `Your project title "${project.title}" has been approved by your supervisor.`,
    link: `/projects/mine`,
    relatedId: project._id,
    relatedModel: 'Project',
  });

  logActivity({ userId: req.user._id, action: 'PROJECT_APPROVED', entity: 'Project', entityId: project._id });
  res.status(200).json({ success: true, message: 'Project approved.', data: { project } });
});

// @desc    Reject / request revision on project
// @route   PATCH /api/projects/:id/reject
// @access  Supervisor
const rejectProject = asyncHandler(async (req, res, next) => {
  const { reason, requestRevision = false } = req.body;
  const project = await Project.findOne({ _id: req.params.id, supervisor: req.user._id });
  if (!project) return next(new ApiError(404, 'Project not found.'));
  if (!reason) return next(new ApiError(400, 'A reason is required.'));

  project.status = requestRevision ? 'revision_requested' : 'rejected';
  project.supervisorComment = reason;
  project.rejectedAt = new Date();
  await project.save();

  await createNotification({
    recipientId: project.student,
    type: 'project_rejected',
    title: requestRevision ? 'Project Revision Requested' : 'Project Title Rejected',
    message: `Your project title "${project.title}" requires ${requestRevision ? 'revision' : 'was rejected'}. Reason: ${reason}`,
    link: `/projects/mine`,
    relatedId: project._id,
    relatedModel: 'Project',
  });

  res.status(200).json({ success: true, message: requestRevision ? 'Revision requested.' : 'Project rejected.', data: { project } });
});

// @desc    Coordinator view all projects
// @route   GET /api/projects
// @access  Coordinator, Admin
const getAllProjects = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Project.countDocuments(filter);
  const projects = await Project.find(filter)
    .populate('student', 'firstName lastName email matricNumber')
    .populate('supervisor', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({ success: true, count: total, data: { projects } });
});

module.exports = { submitProject, getMyProject, updateProject, getPendingProjects, approveProject, rejectProject, getAllProjects };