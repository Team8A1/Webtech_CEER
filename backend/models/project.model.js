const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    snippet: {
        type: String,
        required: true
    },
    image: {
        type: String, // Cloudinary image URL
        required: false
    },
    imageId: {
        type: String, // Cloudinary public_id for deletion
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', projectSchema);
