const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllEvents, createEvent, deleteEvent } = require('../controllers/eventController');

// Multer config for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', getAllEvents);
router.post('/', upload.single('image'), createEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
