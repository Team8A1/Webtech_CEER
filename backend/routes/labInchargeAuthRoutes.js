const express = require('express');
const router = express.Router();
const { googleAuth, loginWithPassword, logout } = require('../controllers/labInchargeAuthController');

router.post('/login', loginWithPassword);
router.post('/google', googleAuth);
router.post('/logout', logout);

module.exports = router;
