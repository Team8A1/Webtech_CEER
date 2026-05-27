const express = require('express');
const router = express.Router();
const {
    createTeam,
    getFacultyTeams,
    getAvailableStudents,
    getStudentTeam,
    updateTeam
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Faculty routes
router.post('/faculty/team/create', protect, authorize('faculty'), createTeam);
router.get('/faculty/team/list', protect, authorize('faculty'), getFacultyTeams);
router.get('/faculty/team/students', protect, authorize('faculty'), getAvailableStudents);
router.put('/faculty/team/update/:teamId', protect, authorize('faculty'), updateTeam);

// Student routes
router.get('/student/team/details', protect, authorize('student'), getStudentTeam);

module.exports = router;
