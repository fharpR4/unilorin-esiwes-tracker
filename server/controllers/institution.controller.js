const Institution = require('../models/Institution');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all active institutions
// @route   GET /api/institutions
// @access  PUBLIC — no auth required (needed for registration)
const getAllInstitutions = asyncHandler(async (req, res) => {
  const institutions = await Institution.find({ isActive: true })
    .sort({ name: 1 })
    .select('name acronym type address logoUrl');

  res.status(200).json({
    success: true,
    count: institutions.length,
    data: { institutions },
  });
});

// @desc    Create institution
// @route   POST /api/institutions
// @access  Admin
const createInstitution = asyncHandler(async (req, res, next) => {
  const { name, acronym, type, address, logoUrl } = req.body;
  if (!name?.trim()) return next(new ApiError(400, 'Institution name is required.'));

  const exists = await Institution.findOne({ name: { $regex: name, $options: 'i' } });
  if (exists) return next(new ApiError(409, 'An institution with this name already exists.'));

  const institution = await Institution.create({ name: name.trim(), acronym, type, address, logoUrl });
  res.status(201).json({
    success: true,
    message: 'Institution created.',
    data: { institution },
  });
});

// @desc    Update institution
// @route   PUT /api/institutions/:id
// @access  Admin
const updateInstitution = asyncHandler(async (req, res, next) => {
  const institution = await Institution.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!institution) return next(new ApiError(404, 'Institution not found.'));
  res.status(200).json({ success: true, message: 'Institution updated.', data: { institution } });
});

// @desc    Deactivate institution (soft delete)
// @route   DELETE /api/institutions/:id
// @access  Admin
const deleteInstitution = asyncHandler(async (req, res, next) => {
  const institution = await Institution.findById(req.params.id);
  if (!institution) return next(new ApiError(404, 'Institution not found.'));
  institution.isActive = false;
  await institution.save();
  res.status(200).json({ success: true, message: 'Institution deactivated.' });
});

module.exports = { getAllInstitutions, createInstitution, updateInstitution, deleteInstitution };