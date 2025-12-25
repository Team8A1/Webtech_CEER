const express = require('express');
const router = express.Router();
const { getEnergyAnalysis } = require('../controllers/energyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/analysis', protect, authorize('student'), getEnergyAnalysis);

module.exports = router;
