const express = require('express');
const router = express.Router();
const { facultyLogin, facultyGoogleLogin, facultyLogout, changePassword } = require('../controllers/facultyAuth.controller');

// normal login 
router.post('/login', facultyLogin);

// login through auth
router.post('/google-login', facultyGoogleLogin);

// logout
router.post('/logout', facultyLogout);

// change password
router.post('/change-password', changePassword);

module.exports = router;
