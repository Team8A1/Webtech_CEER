const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
    {
        teamName: {
            type: String,
            trim: true,
        },
        problemStatement: {
            type: String,
            required: true,
            trim: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        guide: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Faculty',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
