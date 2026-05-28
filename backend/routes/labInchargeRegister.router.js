const express = require('express');
const router = express.Router();
const { registerLabIncharge, getAllLabIncharges } = require('../controllers/labInchargeRegister.controller');

/**
 * @route   POST /api/lab/register
 * @desc    Register a new lab incharge
 * @access  Public
 */
router.post('/register', registerLabIncharge);



module.exports = router;

