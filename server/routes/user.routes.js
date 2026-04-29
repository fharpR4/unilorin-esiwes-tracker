const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUserById, updateUser, deactivateUser, reactivateUser,
  getStudents, getSupervisors, getMyAssignedStudents, assignStudentToSelf, removeAssignedStudent,
  getStudentsForSupervisor,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const validate = require('../middleware/validate');
const { updateUserValidation } = require('../validators/user.validator');

router.use(protect);

// Supervisor-specific routes
router.get('/my-students', authorize('supervisor'), getMyAssignedStudents);
router.post('/assign-student', authorize('supervisor'), assignStudentToSelf);
router.delete('/assigned-students/:studentId', authorize('supervisor'), removeAssignedStudent);
// Supervisors browse students to assign (filtered by institution/faculty)
router.get('/students-for-assignment', authorize('supervisor'), getStudentsForSupervisor);

// Coordinator + Admin
router.get('/students', authorize('coordinator', 'admin'), getStudents);
// Students can also call getSupervisors (they need to pick one during application)
router.get('/supervisors', authorize('student', 'coordinator', 'admin', 'supervisor'), getSupervisors);

// Admin only
router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', authorize('admin', 'coordinator', 'supervisor'), getUserById);
router.put('/:id', authorize('admin'), updateUserValidation, validate, updateUser);
router.patch('/:id/deactivate', authorize('admin'), deactivateUser);
router.patch('/:id/reactivate', authorize('admin'), reactivateUser);

module.exports = router;