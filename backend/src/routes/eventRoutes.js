const express = require('express');
const router = express.Router();
const { createEvent, getEvents, attendEvent, deleteEvent } = require('../controllers/eventController');
const protect = require('../middleware/authMiddleware');

router.post('/create', protect, createEvent);
router.get('/', protect, getEvents);
router.post('/attend/:id', protect, attendEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
