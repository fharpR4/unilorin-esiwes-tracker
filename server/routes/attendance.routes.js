const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getTodayAttendance, getMyAttendance, getStudentAttendance } = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);
router.post('/checkin', authorize('student'), checkIn);
router.post('/checkout', authorize('student'), checkOut);
router.get('/today', authorize('student'), getTodayAttendance);
router.get('/', authorize('student'), getMyAttendance);
router.get('/student/:studentId', authorize('coordinator', 'admin'), getStudentAttendance);

module.exports = router;