const express = require('express');
const router = express.Router();
const { getDashboardData, registerBulkStudents, registerBulkFaculty } = require('../controllers/adminController');

// Public route for now as requested for verification
router.get('/dashboard', getDashboardData);
router.post('/register/students', registerBulkStudents);
router.post('/register/faculty', registerBulkFaculty);

module.exports = router;
