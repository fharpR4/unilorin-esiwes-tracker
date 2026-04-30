const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

// IMPORTANT: specific routes must come before parameterized routes
router.get('/', getMyNotifications);
router.patch('/read-all', markAllAsRead);       // Must be BEFORE /:id/read
router.patch('/:id/read', markAsRead);

module.exports = router;