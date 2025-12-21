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



const registerBulkStudents = async (req, res) => {
    try {
        const { students } = req.body;
        if (!students || !Array.isArray(students)) {
            return res.status(400).json({ success: false, message: 'Invalid data format' });
        }

        const results = { success: [], failed: [] };

        for (const student of students) {
            try {
                if (!student.email || !student.name) {
                    results.failed.push({ email: student.email, reason: 'Missing name or email' });
                    continue;
                }

                const exists = await User.findOne({ email: student.email });
                if (exists) {
                    results.failed.push({ email: student.email, reason: 'Already exists' });
                    continue;
                }

                const newStudent = new User({
                    name: student.name,
                    email: student.email,
                    division: student.division ? student.division.toUpperCase() : undefined,
                    role: 'student'
                });
                await newStudent.save();
                results.success.push(student.email);
            } catch (err) {
                results.failed.push({ email: student.email, reason: err.message });
            }
        }

        res.status(200).json({ success: true, results });
    } catch (error) {
        console.error('Bulk student register error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const registerBulkFaculty = async (req, res) => {
    try {
        const { faculties } = req.body;
        if (!faculties || !Array.isArray(faculties)) {
            return res.status(400).json({ success: false, message: 'Invalid data format' });
        }

        const results = { success: [], failed: [] };

        for (const faculty of faculties) {
            try {
                if (!faculty.email || !faculty.name) {
                    results.failed.push({ email: faculty.email, reason: 'Missing name or email' });
                    continue;
                }

                const exists = await Faculty.findOne({ email: faculty.email });
                if (exists) {
                    results.failed.push({ email: faculty.email, reason: 'Already exists' });
                    continue;
                }

                const newFaculty = new Faculty({
                    name: faculty.name,
                    email: faculty.email,
                    department: faculty.department || '',
                    role: 'faculty',
                    isApproved: true
                });
                await newFaculty.save();
                results.success.push(faculty.email);
            } catch (err) {
                results.failed.push({ email: faculty.email, reason: err.message });
            }
        }
        res.status(200).json({ success: true, results });
    } catch (error) {
        console.error('Bulk faculty register error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getDashboardData,
    registerBulkStudents,
    registerBulkFaculty
};
