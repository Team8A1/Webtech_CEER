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
    },
    // Density in kg/m³
    density: {
        type: Number,
        required: true,
        default: 0
    },
    // Embodied Energy Coefficient in MJ/kg
    embodiedEnergy: {
        type: Number,
        required: true,
        default: 0
    },
    // Fixed Dimension in mm (Thickness for sheets, Diameter for rods, Weight for units)
    fixedDimension: {
        type: Number,
        default: 0
    },
    // Form Type to determine calculation logic
    formType: {
        type: String,
        enum: ['sheet', 'rod', 'unit'],
        default: 'unit'
    }
}, {
    timestamps: true
});

const Material = mongoose.model('Material', materialSchema);

module.exports = Material;
