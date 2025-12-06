const Faculty = require('../models/Faculty');
const Team = require('../models/Team');
const User = require('../models/User');

const getDashboardData = async (req, res) => {
    try {
        // 1. Get all faculties
        const faculties = await Faculty.find({}).select('-password');

        // 2. For each faculty, get their teams
        const dashboardData = await Promise.all(faculties.map(async (faculty) => {
            const teams = await Team.find({ guide: faculty._id })
                .populate('members', 'name usn email') // Populate student details
                .lean(); // Convert to plain JS object to allow modification

            return {
                faculty: faculty,
                teams: teams
            };
        }));

        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

module.exports = {
    getDashboardData
};
