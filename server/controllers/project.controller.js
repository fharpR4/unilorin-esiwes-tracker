const Project = require('../models/Project');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification, logActivity } = require('../utils/createNotification');

// @desc    Student submits project title
// @route   POST /api/projects
// @access  Student
const submitProject = asyncHandler(async (req, res, next) => {
  const { title, description, objectives, techStack } = req.body;

  if (!title || title.trim().length < 5) {
    return next(new ApiError(400, 'Project title must be at least 5 characters.'));
  }
  if (!description || description.trim().length < 30) {
    return next(new ApiError(400, 'Project description must be at least 30 characters.'));
  }

  const application = await Application.findOne({
    student: req.user._id,
    status: 'approved',
  });
  if (!application) {
    return next(new ApiError(404, 'You need an approved SIWES application before submitting a project title.'));
  }

  // Check for existing non-rejected project
  const existing = await Project.findOne({
    student: req.user._id,
    application: application._id,
    status: { $in: ['pending', 'approved'] },
  });
  if (existing) {
    return next(new ApiError(409, 'You already have a pending or approved project title. Edit that one instead.'));
  }

  const project = await Project.create({
    student: req.user._id,
    application: application._id,
    supervisor: application.supervisor,
    title: title.trim(),
    description: description.trim(),
    objectives: Array.isArray(objectives) ? objectives.filter((o) => o?.trim()) : [],
    techStack: Array.isArray(techStack) ? techStack.filter((t) => t?.trim()) : [],
  });

  await createNotification({
    recipientId: application.supervisor,
    type: 'log_resubmitted',
    title: 'New Project Title Submitted',
    message: `${req.user.firstName} ${req.user.lastName} submitted a project title for your review: "${title}"`,
    link: `/projects/pending`,
    relatedId: project._id,
    relatedModel: 'Project',
  });

  logActivity({ userId: req.user._id, action: 'PROJECT_SUBMITTED', entity: 'Project', entityId: project._id });

  res.status(201).json({
    success: true,
    message: 'Project title submitted. Your supervisor has been notified.',
    data: { project },
  });
});

// @desc    Get student's own project(s)
// @route   GET /api/projects/mine
// @access  Student
const getMyProject = asyncHandler(async (req, res) => {
  const projects = await Project.find({ student: req.user._id })
    .populate('supervisor', 'firstName lastName email title supervisorDepartment')
    .sort({ createdAt: -1 });

  // Return the most recent one as primary
  const project = projects[0] || null;

  res.status(200).json({
    success: true,
    data: { project, projects },
  });
});

// @desc    Student updates pending/rejected project
// @route   PUT /api/projects/:id
// @access  Student
const updateProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findOne({ _id: req.params.id, student: req.user._id });
  if (!project) return next(new ApiError(404, 'Project not found.'));
  if (project.status === 'approved') {
    return next(new ApiError(400, 'Cannot edit an approved project title.'));
  }

  const { title, description, objectives, techStack } = req.body;
  if (title) project.title = title.trim();
  if (description) project.description = description.trim();
  if (objectives) project.objectives = objectives.filter((o) => o?.trim());
  if (techStack) project.techStack = techStack.filter((t) => t?.trim());

  if (['rejected', 'revision_requested'].includes(project.status)) {
    project.status = 'pending';
    project.supervisorComment = '';
  }

  await project.save();

  // Notify supervisor of resubmission
  await createNotification({
    recipientId: project.supervisor,
    type: 'log_resubmitted',
    title: 'Project Title Updated',
    message: `${req.user.firstName} ${req.user.lastName} updated their project title: "${project.title}"`,
    link: `/projects/pending`,
    relatedId: project._id,
    relatedModel: 'Project',
  });

  res.status(200).json({
    success: true,
    message: 'Project updated and resubmitted for approval.',
    data: { project },
  });
});

// @desc    Get pending projects for supervisor
// @route   GET /api/projects/pending
// @access  Supervisor
const getPendingProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    supervisor: req.user._id,
    status: { $in: ['pending', 'revision_requested'] },
  })
    .populate('student', 'firstName lastName email matricNumber department courseOfStudy')
    .populate('application', 'organizationName')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    count: projects.length,
    data: { projects },
  });
});

// @desc    Supervisor approves project title
// @route   PATCH /api/projects/:id/approve
// @access  Supervisor
const approveProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findOne({
    _id: req.params.id,
    supervisor: req.user._id,
  });
  if (!project) return next(new ApiError(404, 'Project not found or not assigned to you.'));
  if (!['pending', 'revision_requested'].includes(project.status)) {
    return next(new ApiError(400, `Project status is already '${project.status}'.`));
  }

  project.status = 'approved';
  project.supervisorComment = req.body.comment || '';
  project.approvedAt = new Date();
  await project.save();

  await createNotification({
    recipientId: project.student,
    type: 'project_approved',
    title: 'Project Title Approved!',
    message: `Your project title "${project.title}" has been approved by your supervisor. You can now proceed with your project.`,
    link: `/projects/mine`,
    relatedId: project._id,
    relatedModel: 'Project',
  });

  logActivity({ userId: req.user._id, action: 'PROJECT_APPROVED', entity: 'Project', entityId: project._id });

  res.status(200).json({
    success: true,
    message: 'Project approved. Student has been notified.',
    data: { project },
  });
});

// @desc    Supervisor rejects or requests revision
// @route   PATCH /api/projects/:id/reject
// @access  Supervisor
const rejectProject = asyncHandler(async (req, res, next) => {
  const { reason, requestRevision = false } = req.body;
  if (!reason?.trim()) {
    return next(new ApiError(400, 'A reason is required when rejecting or requesting revision.'));
  }

  const project = await Project.findOne({
    _id: req.params.id,
    supervisor: req.user._id,
  });
  if (!project) return next(new ApiError(404, 'Project not found.'));

  project.status = requestRevision ? 'revision_requested' : 'rejected';
  project.supervisorComment = reason;
  project.rejectedAt = new Date();
  await project.save();

  await createNotification({
    recipientId: project.student,
    type: 'project_rejected',
    title: requestRevision ? 'Project Revision Requested' : 'Project Title Rejected',
    message: requestRevision
      ? `Your supervisor requested revisions on "${project.title}". Reason: ${reason}`
      : `Your project title "${project.title}" was rejected. Reason: ${reason}`,
    link: `/projects/mine`,
    relatedId: project._id,
    relatedModel: 'Project',
  });

  res.status(200).json({
    success: true,
    message: requestRevision ? 'Revision requested. Student notified.' : 'Project rejected. Student notified.',
    data: { project },
  });
});

// @desc    Coordinator/Admin view all projects
// @route   GET /api/projects
// @access  Coordinator, Admin
const getAllProjects = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Project.countDocuments(filter);
  const projects = await Project.find(filter)
    .populate('student', 'firstName lastName email matricNumber department')
    .populate('supervisor', 'firstName lastName email title supervisorDepartment')
    .populate('application', 'organizationName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: { projects },
  });
});

module.exports = {
  submitProject, getMyProject, updateProject,
  getPendingProjects, approveProject, rejectProject, getAllProjects,
};