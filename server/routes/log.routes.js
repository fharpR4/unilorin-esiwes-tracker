const express = require('express');
const router = express.Router();
const {
  createLog,
  getMyLogs,
  getLogById,
  updateLog,
  deleteLog,
  approveLog,
  rejectLog,
  getPendingLogs,
  getStudentLogs,
  getLogImages,
  getNearbyLogs,
} = require('../controllers/log.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const validate = require('../middleware/validate');
const {
  createLogValidation,
  approveLogValidation,
  rejectLogValidation,
} = require('../validators/log.validator');

router.use(protect);

// Specific routes before parameterized routes
router.get('/pending', authorize('supervisor'), getPendingLogs);
router.get('/nearby', authorize('coordinator', 'admin'), getNearbyLogs);
router.get('/student/:studentId', authorize('coordinator', 'admin'), getStudentLogs);

// Student log CRUD
router.get('/', authorize('student'), getMyLogs);
router.post('/', authorize('student'), createLogValidation, validate, createLog);
router.get('/:id', authorize('student', 'supervisor', 'coordinator', 'admin'), getLogById);
router.put('/:id', authorize('student'), createLogValidation, validate, updateLog);
router.delete('/:id', authorize('student'), deleteLog);

// Log images (coordinator/admin — images excluded from list endpoints for performance)
router.get('/:id/images', authorize('coordinator', 'admin'), getLogImages);

// Supervisor approval actions
router.patch('/:id/approve', authorize('supervisor'), approveLogValidation, validate, approveLog);
router.patch('/:id/reject', authorize('supervisor'), rejectLogValidation, validate, rejectLog);

module.exports = router;