const express = require('express');
const router = express.Router();
const { registerFaculty } = require('../controllers/facultyRegister.controller');

/**
 * @route   POST /api/faculty/register
 * @desc    Register a new faculty member
 * @access  Public
 */

router.post('/register', registerFaculty);

module.exports = router;
