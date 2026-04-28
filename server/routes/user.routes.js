const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  reactivateUser,
  getStudents,
  getSupervisors,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const validate = require('../middleware/validate');
const { updateUserValidation } = require('../validators/user.validator');

// All routes require authentication
router.use(protect);

// Coordinator-accessible routes
router.get('/students', authorize('coordinator', 'admin'), getStudents);
router.get('/supervisors', authorize('coordinator', 'admin'), getSupervisors);

// Admin-only routes
router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', authorize('admin'), getUserById);
router.put('/:id', authorize('admin'), updateUserValidation, validate, updateUser);
router.patch('/:id/deactivate', authorize('admin'), deactivateUser);
router.patch('/:id/reactivate', authorize('admin'), reactivateUser);

module.exports = router;