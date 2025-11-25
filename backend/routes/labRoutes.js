const express = require('express');
const router = express.Router();
const { auth, labInchargeOnly } = require('../middleware/auth');
const { labLogin, labGoogleLogin, labLogout } = require('../controllers/labAuthController');

router.post('/login', labLogin);
router.post('/google-login', labGoogleLogin);
router.post('/logout', auth, labInchargeOnly, labLogout);

router.get('/dashboard', auth, labInchargeOnly, (req, res) => {
  res.json({ message: 'Lab Dashboard', user: req.user });
});

router.get('/approve', auth, labInchargeOnly, (req, res) => {
  res.json({ message: 'Lab Approve', user: req.user });
});

router.post('/approve/:id', auth, labInchargeOnly, (req, res) => {
  res.json({ message: 'Approve Item', user: req.user });
});

module.exports = router;
