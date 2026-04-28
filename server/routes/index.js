const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/logs', require('./log.routes'));
router.use('/institutions', require('./institution.routes'));
router.use('/applications', require('./application.routes'));
router.use('/attendance', require('./attendance.routes'));
router.use('/projects', require('./project.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/reports', require('./report.routes'));
router.use('/profile', require('./profile.routes'));

module.exports = router;