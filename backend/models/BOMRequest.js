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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BOMRequest', bomRequestSchema);
