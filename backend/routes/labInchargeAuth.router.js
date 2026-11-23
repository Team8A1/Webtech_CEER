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
// protect: authenticates token & sets req.user / req.tokenDecoded for revocation
router.post('/change-password', protect, changePassword);

module.exports = router;
