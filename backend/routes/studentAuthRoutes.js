const express = require('express');
const router = express.Router();
const { googleAuth, loginWithPassword, logout } = require('../controllers/authController');

/**
 * @route   POST /api/student/auth/login
 * @desc    Authenticate student with email and password
 * @access  Public
 */
router.post('/login', loginWithPassword);

/**
 * @route   POST /api/student/auth/google
 * @desc    Authenticate student with Google OAuth
 * @access  Public
 */
router.post('/google', googleAuth);

/**
 * @route   POST /api/student/auth/logout
 * @desc    Logout student
 * @access  Public
 */
router.post('/logout', logout);

module.exports = router;
