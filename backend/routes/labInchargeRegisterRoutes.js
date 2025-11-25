const express = require('express');
const router = express.Router();
const { registerLabIncharge } = require('../controllers/labInchargeRegisterController');

/**
 * @route   POST /api/lab/register
 * @desc    Register a new lab incharge
 * @access  Public
 */
router.post('/register', registerLabIncharge);

module.exports = router;
