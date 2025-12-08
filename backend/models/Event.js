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

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    imageId: {
        type: String
    },
    category: {
        type: String,
        default: 'General' // Default category as AdminDashboard doesn't seem to send it, but RecentEvents needs it.
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', eventSchema);
