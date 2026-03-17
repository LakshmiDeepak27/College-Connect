const express = require('express');
const router = express.Router();
const { getMessages, getConversations, markAsRead, getTotalUnreadCount } = require('../controllers/messageController');
const protect = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/unread-count', protect, getTotalUnreadCount);
router.get('/:userId', protect, getMessages);
router.put('/read/:userId', protect, markAsRead);

module.exports = router;
