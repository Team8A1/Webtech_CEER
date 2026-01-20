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

        // Auto-inactivate events where date is today or has passed
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

        const updates = events.map(async (event) => {
            if (event.isActive && event.date) {
                // Parse dd-mm-yyyy format
                const [day, month, year] = event.date.split('-').map(Number);
                const eventDate = new Date(year, month - 1, day);
                eventDate.setHours(0, 0, 0, 0);

                // Inactivate if event date has passed (before today)
                if (eventDate < today) {
                    event.isActive = false;
                    await event.save();
                }
            }
        });

        await Promise.all(updates);

        // Refetch to get updated state
        const updatedEvents = await Event.find({}).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: updatedEvents
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

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Admin
const updateEvent = async (req, res) => {
    try {
        const { title, date, category } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Update basic fields
        if (title) event.title = title;
        if (date) event.date = date;
        if (category) event.category = category;

        // Update image if new one is provided
        if (req.file) {
            // Delete old image from Cloudinary
            if (event.imageId) {
                await cloudinary.uploader.destroy(event.imageId);
            }

            const result = await uploadFromBuffer(req.file.buffer);
            event.image = result.secure_url;
            event.imageId = result.public_id;
        }

        await event.save();

        res.status(200).json({
            success: true,
            data: event,
            message: 'Event updated successfully'
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Toggle event active/inactive status
// @route   PATCH /api/events/:id/toggle-status
// @access  Admin
const toggleEventStatus = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        event.isActive = !event.isActive;
        await event.save();

        res.status(200).json({
            success: true,
            data: event,
            message: `Event marked as ${event.isActive ? 'active' : 'inactive'}`
        });
    } catch (error) {
        console.error('Error toggling event status:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

module.exports = {
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventStatus
};
