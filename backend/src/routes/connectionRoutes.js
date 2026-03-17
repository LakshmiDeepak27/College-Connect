const express = require('express');
const router = express.Router();
const { sendRequest, acceptRequest, rejectRequest, getPendingRequests, getConnectionsList, checkStatus } = require('../controllers/connectionController');
const protect = require('../middleware/authMiddleware');

router.post('/send', protect, sendRequest);
router.post('/accept', protect, acceptRequest);
router.post('/reject', protect, rejectRequest);
router.get('/requests', protect, getPendingRequests); // For a user to view incoming requests
router.get('/list', protect, getConnectionsList); // List accepted connections
router.get('/status/:userId', protect, checkStatus);

module.exports = router;
