const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUserById, updateUser, deactivateUser, reactivateUser,
  getStudents, getSupervisors, getStudentsForSupervisor,
  getMyAssignedStudents, assignStudentToSelf, removeAssignedStudent,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const validate = require('../middleware/validate');
const { updateUserValidation } = require('../validators/user.validator');

// PUBLIC — supervisors list needed for application submission (no auth)
// We expose a lighter version without auth for the application form
router.get('/supervisors-public', getSupervisors); // used by registration & application pages

// All routes below require auth
router.use(protect);

// Supervisor routes
router.get('/my-students', authorize('supervisor'), getMyAssignedStudents);
router.post('/assign-student', authorize('supervisor'), assignStudentToSelf);
router.delete('/assigned-students/:studentId', authorize('supervisor'), removeAssignedStudent);
router.get('/students-for-assignment', authorize('supervisor'), getStudentsForSupervisor);

// Authenticated supervisor list (with more detail)
router.get('/supervisors', authorize('student', 'coordinator', 'admin', 'supervisor'), getSupervisors);

// Coordinator + Admin
router.get('/students', authorize('coordinator', 'admin'), getStudents);

// Admin only
router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', authorize('admin', 'coordinator', 'supervisor'), getUserById);
router.put('/:id', authorize('admin'), updateUserValidation, validate, updateUser);
router.patch('/:id/deactivate', authorize('admin'), deactivateUser);
router.patch('/:id/reactivate', authorize('admin'), reactivateUser);

module.exports = router;