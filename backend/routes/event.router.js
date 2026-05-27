const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllEvents, createEvent, updateEvent, deleteEvent, toggleEventStatus } = require('../controllers/eventController');

// Multer config for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', getAllEvents);
router.post('/', upload.single('image'), createEvent);
router.put('/:id', upload.single('image'), updateEvent);
router.patch('/:id/toggle-status', toggleEventStatus);
router.delete('/:id', deleteEvent);

module.exports = router;
