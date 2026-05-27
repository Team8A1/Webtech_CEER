const express = require('express');
const router = express.Router();
const { registerStudent } = require('../controllers/studentRegisterController');

/**
 * @route   POST /api/student/register
 * @desc    Register a new student
 * @access  Public
 */
router.post('/register', registerStudent);

module.exports = router;
