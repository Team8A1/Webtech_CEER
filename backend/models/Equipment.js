const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: {
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
    },
    inCharge: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;
