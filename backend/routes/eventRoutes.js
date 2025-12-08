const express = require('express');
const router = express.Router();
const multer = require('multer');
const eventController = require('../controllers/eventController');

// Multer config for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/events', eventController.getEvents);
router.post('/events', upload.single('image'), eventController.createEvent);
router.put('/events/:id', upload.single('image'), eventController.updateEvent);
router.delete('/events/:id', eventController.deleteEvent);

module.exports = router;
