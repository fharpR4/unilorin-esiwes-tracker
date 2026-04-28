const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all users (paginated, filterable)
// @route   GET /api/users
// @access  Admin
const getAllUsers = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    role,
    isActive,
    institution,
    search,
  } = req.query;

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

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Admin
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate('institution', 'name acronym logoUrl');

  if (!user) {
    return next(new ApiError(404, 'User not found.'));
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    phone,
    courseOfStudy,
    matricNumber,
    department,
    level,
    institution,
  } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError(404, 'User not found.'));
  }

  // Only allow updating non-critical fields via this endpoint
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;
  if (courseOfStudy !== undefined) user.courseOfStudy = courseOfStudy;
  if (matricNumber !== undefined) user.matricNumber = matricNumber;
  if (department !== undefined) user.department = department;
  if (level !== undefined) user.level = level;
  if (institution !== undefined) user.institution = institution;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated successfully.',
    data: { user },
  });
});

// @desc    Deactivate user account
// @route   PATCH /api/users/:id/deactivate
// @access  Admin
const deactivateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ApiError(404, 'User not found.'));

  if (user._id.toString() === req.user._id.toString()) {
    return next(new ApiError(400, 'You cannot deactivate your own account.'));
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: `Account for ${user.email} has been deactivated.`,
    data: { user },
  });
});

// @desc    Reactivate user account
// @route   PATCH /api/users/:id/reactivate
// @access  Admin
const reactivateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ApiError(404, 'User not found.'));

  user.isActive = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: `Account for ${user.email} has been reactivated.`,
    data: { user },
  });
});

// @desc    Get all students for a coordinator's institution
// @route   GET /api/users/students
// @access  Coordinator
const getStudents = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, search } = req.query;

  const filter = {
    role: 'student',
    institution: req.user.institution,
    isActive: true,
  };

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { matricNumber: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(filter);
  const students = await User.find(filter)
    .select('-password')
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

// @desc    Get all supervisors
// @route   GET /api/users/supervisors
// @access  Coordinator
const getSupervisors = asyncHandler(async (req, res, next) => {
  const supervisors = await User.find({ role: 'supervisor', isActive: true })
    .select('firstName lastName email phone')
    .sort({ lastName: 1, firstName: 1 });

  res.status(200).json({
    success: true,
    count: supervisors.length,
    data: { supervisors },
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  reactivateUser,
  getStudents,
  getSupervisors,
};