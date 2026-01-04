const express = require('express');
const router = express.Router();
const { getCarbonAnalysis } = require('../controllers/carbonController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/analysis', protect, authorize('student'), getCarbonAnalysis);

module.exports = router;
