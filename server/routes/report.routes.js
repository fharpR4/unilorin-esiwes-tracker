const express = require('express');
const router = express.Router();
const { submitReport, getMyReports, getStudentReports, getPendingReports, reviewReport } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);
router.post('/', authorize('student'), submitReport);
router.get('/mine', authorize('student'), getMyReports);
router.get('/pending', authorize('supervisor'), getPendingReports);
router.get('/student/:studentId', authorize('coordinator', 'admin'), getStudentReports);
router.patch('/:id/review', authorize('supervisor'), reviewReport);

module.exports = router;