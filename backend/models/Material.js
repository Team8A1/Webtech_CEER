const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    dimension: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    imageId: {
        type: String, // Cloudinary public_id for deletion
        required: true
    }
}, {
    timestamps: true
});

const Material = mongoose.model('Material', materialSchema);

module.exports = Material;
