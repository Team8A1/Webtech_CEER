const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String, // Keeping as string to allow flexible formats like "December 15, 2025" or "Dec 5-10"
        required: true
    },
    image: {
        type: String,
        required: true
    },
    imageUrl: { // For backward compatibility
        type: String
    },
    imageId: {
        type: String
    },
    category: {
        type: String,
        required: true,
        default: 'General'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', eventSchema);
