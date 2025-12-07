const Event = require('../models/Event');

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
// @access  Admin (Protected in real app, keeping simple for now as requested)
const createEvent = async (req, res) => {
    try {
        const { title, date, image, category } = req.body;

        if (!title || !date || !image || !category) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const newEvent = await Event.create({
            title,
            date,
            image,
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
