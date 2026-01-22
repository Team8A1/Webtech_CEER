const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    getAllProjects,
    createProject,
    updateProject,
    deleteProject
} = require('../controllers/projectController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Public route
router.get('/', getAllProjects);

// Admin routes with image upload support
router.post('/', upload.single('image'), createProject);
router.put('/:id', upload.single('image'), updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
