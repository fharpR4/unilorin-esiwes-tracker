const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, getStudentAnalytics, getCoordinatorAnalytics } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);
router.put('/', updateProfile);
router.put('/change-password', changePassword);
router.get('/analytics', authorize('student'), getStudentAnalytics);
router.get('/coordinator-analytics', authorize('coordinator'), getCoordinatorAnalytics);

module.exports = router;