const User = require('../models/User');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../utils/createNotification');

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, isActive, institution, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (institution) filter.institution = institution;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { matricNumber: { $regex: search, $options: 'i' } },
    ];
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .populate('institution', 'name acronym')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: { users },
  });
});

const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate('institution', 'name acronym logoUrl')
    .populate('assignedStudents.student', 'firstName lastName email matricNumber department level');
  if (!user) return next(new ApiError(404, 'User not found.'));
  res.status(200).json({ success: true, data: { user } });
});

const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError(404, 'User not found.'));
  const allowed = [
    'firstName', 'lastName', 'phone', 'courseOfStudy', 'matricNumber', 'department', 'level', 'institution',
    'faculty', 'supervisorDepartment', 'supervisorInstitution', 'staffId', 'title',
  ];
  allowed.forEach((f) => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
  await user.save();
  res.status(200).json({ success: true, message: 'User updated.', data: { user } });
});

const deactivateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError(404, 'User not found.'));
  if (user._id.toString() === req.user._id.toString()) {
    return next(new ApiError(400, 'You cannot deactivate your own account.'));
  }
  user.isActive = false;
  await user.save();
  res.status(200).json({ success: true, message: 'Account deactivated.', data: { user } });
});

const reactivateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError(404, 'User not found.'));
  user.isActive = true;
  await user.save();
  res.status(200).json({ success: true, message: 'Account reactivated.', data: { user } });
});

// For coordinator/admin — students in their institution
const getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, department } = req.query;
  const filter = { role: 'student', isActive: true };

  // Coordinators see only their institution's students
  if (req.user.role === 'coordinator' && req.user.institution) {
    filter.institution = req.user.institution;
  }

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { matricNumber: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (department) filter.department = { $regex: department, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(filter);
  const students = await User.find(filter)
    .select('-password')
    .populate('institution', 'name acronym')
    .sort({ lastName: 1, firstName: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: { students },
  });
});

// For supervisors to browse students and pick who to assign
// Filters by institution name if provided, by department, or shows all
const getStudentsForSupervisor = asyncHandler(async (req, res) => {
  const { search, institution, department, page = 1, limit = 30 } = req.query;
  const filter = { role: 'student', isActive: true };

  // Filter by institution name/id if provided
  if (institution) {
    // Try to match institution by ID or by name search
    const Institution = require('../models/Institution');
    const inst = await Institution.findOne({
      $or: [
        { _id: institution.match(/^[a-f\d]{24}$/i) ? institution : null },
        { name: { $regex: institution, $options: 'i' } },
        { acronym: { $regex: institution, $options: 'i' } },
      ].filter(Boolean),
    });
    if (inst) filter.institution = inst._id;
  }

  if (department) filter.department = { $regex: department, $options: 'i' };

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { matricNumber: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { courseOfStudy: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(filter);
  const students = await User.find(filter)
    .select('firstName lastName email matricNumber department level courseOfStudy institution')
    .populate('institution', 'name acronym')
    .sort({ lastName: 1, firstName: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: { students },
  });
});

// Get supervisors — with full profile info for student selection
const getSupervisors = asyncHandler(async (req, res) => {
  const { faculty, department, institution, search } = req.query;
  const filter = { role: 'supervisor', isActive: true };
  if (faculty) filter.faculty = { $regex: faculty, $options: 'i' };
  if (department) filter.supervisorDepartment = { $regex: department, $options: 'i' };
  if (institution) filter.supervisorInstitution = { $regex: institution, $options: 'i' };
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { staffId: { $regex: search, $options: 'i' } },
    ];
  }

  const supervisors = await User.find(filter)
    .select('firstName lastName email phone faculty supervisorDepartment supervisorInstitution staffId title assignedStudents')
    .sort({ lastName: 1, firstName: 1 });

  res.status(200).json({
    success: true,
    count: supervisors.length,
    data: { supervisors },
  });
});

// Get students assigned to this supervisor (both via applications and manual)
const getMyAssignedStudents = asyncHandler(async (req, res) => {
  const supervisor = await User.findById(req.user._id)
    .populate('assignedStudents.student', 'firstName lastName email matricNumber department level courseOfStudy');

  const manualAssigned = (supervisor.assignedStudents || []).filter((a) => a.student);

  // Also get students with approved applications pointing to this supervisor
  const appStudents = await Application.find({ supervisor: req.user._id, status: 'approved' })
    .populate('student', 'firstName lastName email matricNumber department level courseOfStudy')
    .populate('institution', 'name acronym');

  // Avoid duplicates
  const appStudentIds = new Set(appStudents.map((a) => a.student?._id?.toString()).filter(Boolean));
  const onlyManual = manualAssigned.filter((as) => !appStudentIds.has(as.student?._id?.toString()));

  res.status(200).json({
    success: true,
    data: {
      applicationStudents: appStudents.map((a) => ({
        ...a.student.toObject(),
        applicationId: a._id,
        organizationName: a.organizationName,
      })),
      manualStudents: onlyManual.map((as) => as.student),
      total: appStudents.length + onlyManual.length,
    },
  });
});

// Supervisor manually adds a student to their list
const assignStudentToSelf = asyncHandler(async (req, res, next) => {
  const { studentId } = req.body;
  if (!studentId) return next(new ApiError(400, 'studentId is required.'));

  const supervisor = await User.findById(req.user._id);
  const student = await User.findOne({ _id: studentId, role: 'student', isActive: true });
  if (!student) return next(new ApiError(404, 'Student not found.'));

  const already = supervisor.assignedStudents.some(
    (a) => a.student.toString() === studentId.toString()
  );
  if (!already) {
    supervisor.assignedStudents.push({ student: studentId });
    await supervisor.save();
  }

  await createNotification({
    recipientId: studentId,
    type: 'system',
    title: 'Supervisor Assignment',
    message: `${supervisor.title ? supervisor.title + ' ' : ''}${supervisor.firstName} ${supervisor.lastName} has added you as an assigned student.`,
    link: '/applications',
  });

  res.status(200).json({ success: true, message: 'Student assigned successfully.' });
});

// Remove a manually assigned student
const removeAssignedStudent = asyncHandler(async (req, res) => {
  const supervisor = await User.findById(req.user._id);
  supervisor.assignedStudents = supervisor.assignedStudents.filter(
    (a) => a.student.toString() !== req.params.studentId
  );
  await supervisor.save();
  res.status(200).json({ success: true, message: 'Student removed from your list.' });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  reactivateUser,
  getStudents,
  getSupervisors,
  getStudentsForSupervisor,
  getMyAssignedStudents,
  assignStudentToSelf,
  removeAssignedStudent,
};