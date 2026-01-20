const express = require('express');
const router = express.Router();
const {
    getAllProjects,
    createProject,
    updateProject,
    deleteProject
} = require('../controllers/projectController');

// Public route
router.get('/', getAllProjects);

// Admin routes (you can add auth middleware if needed)
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
