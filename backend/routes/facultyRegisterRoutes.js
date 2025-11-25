const express = require('express');
const router = express.Router();
const { registerFaculty } = require('../controllers/facultyRegisterController');

/**
 * @route   POST /api/faculty/register
 * @desc    Register a new faculty member
 * @access  Public
 */
console.log("Faculty Register Route Loaded");

router.post('/register', registerFaculty);

module.exports = router;
