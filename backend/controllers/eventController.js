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

const getEvents = async (req, res) => {
    try {
        let events = await Event.find().sort({ createdAt: -1 });

        // If no events exist, seed the database with the initial data
        if (events.length === 0) {
            const initialEvents = [
                {
                    title: 'Tech Summit 2025',
                    date: 'December 15, 2025',
                    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=500&fit=crop',
                    category: 'Conference',
                    description: 'Annual Tech Summit'
                },
                {
                    title: 'Hackathon Week',
                    date: 'December 5-10, 2025',
                    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=500&fit=crop',
                    category: 'Competition',
                    description: 'Week long hackathon'
                }
            ];

            await Event.insertMany(initialEvents);
            events = await Event.find().sort({ createdAt: -1 });
        }

        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

const createEvent = async (req, res) => {
    try {
        const { title, date, description, category } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image is required' });
        }

        const result = await uploadFromBuffer(req.file.buffer);

        const newEvent = new Event({
            title,
            date,
            description,
            category: category || 'General',
            imageUrl: result.secure_url,
            imageId: result.public_id
        });

        await newEvent.save();

        res.status(201).json({
            success: true,
            data: newEvent,
            message: 'Event created successfully'
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, date, description, category } = req.body;

        let event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        let imageUrl = event.imageUrl;
        let imageId = event.imageId;

        // If new image is uploaded
        if (req.file) {
            // Delete old image if it exists and has an ID (seeded data might not have ID)
            if (event.imageId) {
                await cloudinary.uploader.destroy(event.imageId);
            }
            // Upload new image
            const result = await uploadFromBuffer(req.file.buffer);
            imageUrl = result.secure_url;
            imageId = result.public_id;
        }

        event.title = title || event.title;
        event.date = date || event.date;
        event.description = description || event.description;
        event.category = category || event.category;
        event.imageUrl = imageUrl;
        event.imageId = imageId;

        await event.save();

        res.status(200).json({ success: true, data: event, message: 'Event updated successfully' });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Delete image from Cloudinary if it exists
        if (event.imageId) {
            await cloudinary.uploader.destroy(event.imageId);
        }

        await Event.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent
};
