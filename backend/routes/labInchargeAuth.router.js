const express = require('express');
const router = express.Router();
const { googleAuth, loginWithPassword, logout, changePassword } = require('../controllers/labInchargeAuthController');

// normal login 
router.post('/login', loginWithPassword);
// google login
router.post('/google', googleAuth);
// logout
router.post('/logout', logout);
// change password
router.post('/change-password', changePassword);

module.exports = router;
