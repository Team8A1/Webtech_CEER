const Event = require('../models/Event');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper to upload to Cloudinary from buffer
const uploadFromBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary.uploader.upload_stream(
            {
                folder: "events"
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(cld_upload_stream);
    });
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find({}).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Admin 
const createEvent = async (req, res) => {
    try {
        const { title, date, category } = req.body;

        if (!title || !date || !category) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Image is required'
            });
        }

        const result = await uploadFromBuffer(req.file.buffer);

        const newEvent = await Event.create({
            title,
            date,
            image: result.secure_url,
            imageId: result.public_id,
            category
        });

        res.status(201).json({
            success: true,
            data: newEvent,
            message: 'Event created successfully'
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Admin
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Delete image from Cloudinary if it exists
        if (event.imageId) {
            await cloudinary.uploader.destroy(event.imageId);
        }

        await event.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

module.exports = {
    getAllEvents,
    createEvent,
    deleteEvent
};
