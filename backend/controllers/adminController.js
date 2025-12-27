const Admin = require('../models/Admin');
const { generateToken } = require('../utils/tokenUtils');
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
                    role: 'student',
                    password: student.password || 'student@123', // Default password
                    mustChangePassword: true
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
                    password: faculty.password || 'faculty@123', // Default password if missing
                    mustChangePassword: true,
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

const createAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: 'Admin already exists' });
        }

        const admin = await Admin.create({
            email,
            password
        });

        const token = generateToken(admin);

        res.status(201).json({
            success: true,
            data: {
                _id: admin._id,
                email: admin.email,
                role: admin.role,
                token
            }
        });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(admin);

        res.status(200).json({
            success: true,
            data: {
                _id: admin._id,
                email: admin.email,
                role: admin.role,
                token
            }
        });
    } catch (error) {
        console.error('Login admin error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current and new password' });
        }

        // req.user is set by auth middleware
        const admin = await Admin.findById(req.user._id);

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid current password' });
        }

        admin.password = newPassword;
        await admin.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getDashboardData,
    registerBulkStudents,
    registerBulkFaculty,
    createAdmin,
    loginAdmin,
    changePassword
};
