const express = require('express');
const router = express.Router();
const { googleAuth, loginWithPassword, logout, changePassword } = require('../controllers/labInchargeAuth.controller');
const { protect } = require('../middleware/auth.middleware');

// normal login
router.post('/login', loginWithPassword);
// google login
router.post('/google', googleAuth);
// logout — protect so req.tokenDecoded is set for JWT revocation
router.post('/logout', protect, logout);
// change password
router.post('/change-password', changePassword);

module.exports = router;
