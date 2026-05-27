const express = require('express');
const router = express.Router();
const { getEnergyAnalysis } = require('../controllers/energy.controller');
const { protect, authorize } = require('../middleware/authMiddleware.middleware');

router.get('/analysis', protect, authorize('student'), getEnergyAnalysis);

module.exports = router;
