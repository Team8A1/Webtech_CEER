const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/adminController');

// Public route for now as requested for verification
router.get('/dashboard', getDashboardData);

module.exports = router;
