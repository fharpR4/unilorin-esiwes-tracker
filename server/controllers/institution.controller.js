const Institution = require('../models/Institution');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getAllInstitutions = asyncHandler(async (req, res) => {
  const institutions = await Institution.find({ isActive: true }).sort({ name: 1 });
  res.status(200).json({ success: true, count: institutions.length, data: { institutions } });
});

const createInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.create(req.body);
  res.status(201).json({ success: true, message: 'Institution created.', data: { institution } });
});

const updateInstitution = asyncHandler(async (req, res, next) => {
  const institution = await Institution.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!institution) return next(new ApiError(404, 'Institution not found.'));
  res.status(200).json({ success: true, message: 'Institution updated.', data: { institution } });
});

const deleteInstitution = asyncHandler(async (req, res, next) => {
  const institution = await Institution.findById(req.params.id);
  if (!institution) return next(new ApiError(404, 'Institution not found.'));
  institution.isActive = false;
  await institution.save();
  res.status(200).json({ success: true, message: 'Institution deactivated.' });
});

module.exports = { getAllInstitutions, createInstitution, updateInstitution, deleteInstitution };