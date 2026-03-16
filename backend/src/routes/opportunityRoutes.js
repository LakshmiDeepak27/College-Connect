const express = require('express');
const router = express.Router();
const { createOpportunity, getOpportunities, deleteOpportunity } = require('../controllers/opportunityController');
const protect = require('../middleware/authMiddleware');

router.post('/create', protect, createOpportunity);
router.get('/', protect, getOpportunities);
router.delete('/:id', protect, deleteOpportunity);

module.exports = router;
