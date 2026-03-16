const express = require('express');
const router = express.Router();
const { sendRequest, acceptRequest, rejectRequest, getPendingRequests } = require('../controllers/connectionController');
const protect = require('../middleware/authMiddleware');

router.post('/request', protect, sendRequest);
router.post('/accept/:connectionId', protect, acceptRequest);
router.post('/reject/:connectionId', protect, rejectRequest);
router.get('/pending', protect, getPendingRequests); // For a user to view incoming requests

module.exports = router;
