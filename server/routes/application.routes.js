const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getMyApplications,
  getAllApplications,
  approveApplication,
  rejectApplication,
} = require('../controllers/application.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);

// Specific routes first
router.get('/mine', authorize('student'), getMyApplications);

// Student submits
router.post('/', authorize('student'), submitApplication);

// Coordinator/Admin views and acts
router.get('/', authorize('coordinator', 'admin'), getAllApplications);
router.patch('/:id/approve', authorize('coordinator', 'admin'), approveApplication);
router.patch('/:id/reject', authorize('coordinator', 'admin'), rejectApplication);

module.exports = router;