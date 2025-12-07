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
    category: {
        type: String,
        required: true,
        default: 'General'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', eventSchema);
