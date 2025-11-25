const express = require('express');
const router = express.Router();
const { auth, facultyOnly } = require('../middleware/auth');

router.get('/dashboard', auth, facultyOnly, (req, res) => {
  res.json({ message: 'Faculty Dashboard', user: req.user });
});

router.get('/teams', auth, facultyOnly, (req, res) => {
  res.json({ message: 'Faculty Teams', user: req.user });
});

router.post('/team-create', auth, facultyOnly, (req, res) => {
  res.json({ message: 'Create Team', user: req.user });
});

router.get('/approve', auth, facultyOnly, (req, res) => {
  res.json({ message: 'Faculty Approve', user: req.user });
});

router.post('/approve/:id', auth, facultyOnly, (req, res) => {
  res.json({ message: 'Approve Item', user: req.user });
});

module.exports = router;
