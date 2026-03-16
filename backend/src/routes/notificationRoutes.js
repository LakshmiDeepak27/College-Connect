const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.put('/read', protect, markAsRead); // Mark all
router.put('/read/:notificationId', protect, markAsRead); // Mark specific

module.exports = router;
