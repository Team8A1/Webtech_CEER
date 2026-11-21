const express = require('express');
const router = express.Router();
const { googleAuth, loginWithPassword, logout, changePassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

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
 * @desc    Logout student — revokes JWT via Redis denylist
 * @access  Private (needs token to revoke it)
 */
router.post('/logout', protect, logout);

/**
 * @route   POST /api/student/auth/change-password
 * @desc    Change student password
 * @access  Private
 */
router.post('/change-password', changePassword);

module.exports = router;
