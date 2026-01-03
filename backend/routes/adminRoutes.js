const express = require('express');
const router = express.Router();
const {
    getDashboardData,
    registerBulkStudents,
    registerBulkFaculty,
    createAdmin,
    loginAdmin,
    changePassword,
    getMaterialStats,
    getImpactStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Auth Routes
router.post('/login', loginAdmin);
router.post('/create', createAdmin); // Public for initial setup

// Protected Routes - Admin Only
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardData);
router.post('/register/students', registerBulkStudents);
router.post('/register/faculty', registerBulkFaculty);
router.post('/change-password', changePassword);
router.get('/material-stats', getMaterialStats);
router.get('/impact-stats', getImpactStats);

module.exports = router;
