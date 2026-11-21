const express = require('express');
const router = express.Router();
const { facultyLogin, facultyGoogleLogin, facultyLogout, changePassword } = require('../controllers/facultyAuth.controller');
const { protect } = require('../middleware/auth.middleware');

// normal login
router.post('/login', facultyLogin);

// login through Google OAuth
router.post('/google-login', facultyGoogleLogin);

// logout — protect so req.tokenDecoded is set for JWT revocation
router.post('/logout', protect, facultyLogout);

// change password
router.post('/change-password', changePassword);

module.exports = router;
