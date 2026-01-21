const mongoose = require('mongoose');

const bomRequestSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    guideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    slNo: {
        type: String,
        required: true
    },
    sprintNo: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    partName: {
        type: String,
        required: true
    },
    consumableName: {
        type: String,
        required: true
    },
    specification: {
        type: String,
        required: true
    },
    qty: {
        type: Number,
        required: true,
        min: 1
    },
    // Dimensions for Energy Calculation
    length: {
        type: Number, // in meters
        default: 0
    },
    width: {
        type: Number, // in meters
        default: 0
    },
    thickness: {
        type: Number, // in millimeters (auto-populated snapshot)
        default: 0
    },
    weight: {
        type: Number, // Manual weight input in kg (for unit items override)
        default: 0
    },
    calculatedWeight: {
        type: Number, // in kg
        default: 0
    },
    guideApproved: {
        type: Boolean,
        default: false
    },
    guideApprovedAt: {
        type: Date
    },
    labApproved: {
        type: Boolean,
        default: false
    },
    labApprovedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabIncharge'
    },
    labApprovedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    editHistory: [{
        editedBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'editHistory.editedByModel'
        },
        editedByModel: {
            type: String,
            enum: ['Faculty', 'LabIncharge']
        },
        editedByRole: {
            type: String,
            enum: ['guide', 'labIncharge']
        },
        editedAt: {
            type: Date,
            default: Date.now
        },
        changes: {
            type: Map,
            of: {
                oldValue: mongoose.Schema.Types.Mixed,
                newValue: mongoose.Schema.Types.Mixed
            }
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('BOMRequest', bomRequestSchema);
