const express = require('express');
const router = express.Router();
const { registerLabIncharge, getAllLabIncharges } = require('../controllers/labInchargeRegisterController');

/**
 * @route   POST /api/lab/register
 * @desc    Register a new lab incharge
 * @access  Public
 */
router.post('/register', registerLabIncharge);

/**
 * @route   GET /api/lab/list
 * @desc    Get all lab incharges
 * @access  Admin
 */
router.get('/list', getAllLabIncharges);

module.exports = router;

