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

// protect: authenticates token & sets req.user / req.tokenDecoded for revocation
router.post('/change-password', protect, changePassword);

module.exports = router;
