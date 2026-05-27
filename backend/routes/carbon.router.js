const express = require('express');
const router = express.Router();
const { getCarbonAnalysis } = require('../controllers/carbon.controller');
const { protect, authorize } = require('../middleware/authMiddleware.middleware');

router.get('/analysis', protect, authorize('student'), getCarbonAnalysis);

module.exports = router;
