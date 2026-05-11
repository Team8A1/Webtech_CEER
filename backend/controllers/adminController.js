const Admin = require('../models/Admin');
const { generateToken } = require('../utils/tokenUtils');
const Faculty = require('../models/Faculty');
const Team = require('../models/Team');
const User = require('../models/User');
const BOMRequest = require('../models/BOMRequest');
const Material = require('../models/Material');

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

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const rowIndex = i + 2; // +2 because: +1 for 0-index, +1 for header row

            try {
                if (!student.email || !student.name) {
                    results.failed.push({
                        rowIndex,
                        data: student,
                        reason: 'Missing required fields (name or email)'
                    });
                    continue;
                }

                // Check email domain if needed
                const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || '@kletech.ac.in';
                if (!student.email.endsWith(allowedDomain)) {
                    results.failed.push({
                        rowIndex,
                        data: student,
                        reason: `Email domain not allowed. Only ${allowedDomain} emails are accepted`
                    });
                    continue;
                }

                const exists = await User.findOne({ email: student.email });
                if (exists) {
                    results.failed.push({
                        rowIndex,
                        data: student,
                        reason: 'User with this email already exists'
                    });
                    continue;
                }

                const newStudent = new User({
                    name: student.name,
                    email: student.email,
                    usn: student.usn,
                    division: student.division ? student.division.toUpperCase() : undefined,
                    batch: student.batch,
                    role: 'student',
                    password: 'student@123', // Default password
                    mustChangePassword: true,
                    isActive: true
                });
                await newStudent.save();
                results.success.push({ email: student.email, name: student.name });
            } catch (err) {
                results.failed.push({
                    rowIndex,
                    data: student,
                    reason: err.message || 'Unknown error occurred'
                });
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

        for (let i = 0; i < faculties.length; i++) {
            const faculty = faculties[i];
            const rowIndex = i + 2; // +2 because: +1 for 0-index, +1 for header row

            try {
                if (!faculty.email || !faculty.name) {
                    results.failed.push({
                        rowIndex,
                        data: faculty,
                        reason: 'Missing required fields (name or email)'
                    });
                    continue;
                }

                // Check email domain if needed
                const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || '@kletech.ac.in';
                if (!faculty.email.endsWith(allowedDomain)) {
                    results.failed.push({
                        rowIndex,
                        data: faculty,
                        reason: `Email domain not allowed. Only ${allowedDomain} emails are accepted`
                    });
                    continue;
                }

                const exists = await Faculty.findOne({ email: faculty.email });
                if (exists) {
                    results.failed.push({
                        rowIndex,
                        data: faculty,
                        reason: 'Faculty with this email already exists'
                    });
                    continue;
                }

                const newFaculty = new Faculty({
                    name: faculty.name,
                    email: faculty.email,
                    department: faculty.department || '',
                    role: 'faculty',
                    password: 'faculty@123', // Default password if missing
                    mustChangePassword: true,
                    isApproved: true
                });
                await newFaculty.save();
                results.success.push({ email: faculty.email, name: faculty.name });
            } catch (err) {
                results.failed.push({
                    rowIndex,
                    data: faculty,
                    reason: err.message || 'Unknown error occurred'
                });
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

const getMaterialStats = async (req, res) => {
    try {
        const { materials, timeline, month, year } = req.query;
        if (!materials) {
            return res.status(400).json({ success: false, message: 'Material identifiers are required' });
        }

        const materialList = materials.split(',').map(m => m.trim());

        let startDate, endDate;
        const now = new Date();
        const dateCopy = new Date(now);

        switch (timeline) {
            case 'today':
                startDate = new Date(dateCopy.setHours(0, 0, 0, 0));
                endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
                break;
            case 'thisweek':
                startDate = new Date(dateCopy.setDate(dateCopy.getDate() - dateCopy.getDay()));
                startDate.setHours(0, 0, 0, 0);
                endDate = null;
                break;
            case 'thismonth': {
                const m = month ? parseInt(month) - 1 : now.getMonth(); // 0-indexed
                const y = year ? parseInt(year) : now.getFullYear();
                startDate = new Date(y, m, 1);
                endDate   = new Date(y, m + 1, 1); // first day of next month
                break;
            }
            case 'thisyear':
                startDate = new Date(dateCopy.getFullYear(), 0, 1);
                endDate = null;
                break;
            default:
                startDate = new Date(0);
                endDate = null;
        }

        // Build date label and sortKey based on timeline
        let labelExpr, sortKeyExpr;
        if (timeline === 'today') {
            // Today: show one bar for the whole day per material (no hourly breakdown)
            labelExpr   = { $dateToString: { format: "%d-%m-%Y", date: "$labApprovedAt" } };
            sortKeyExpr = { $dateToString: { format: "%Y-%m-%d", date: "$labApprovedAt" } };
        } else if (timeline === 'thisyear') {
            labelExpr   = { $dateToString: { format: "%m-%Y", date: "$labApprovedAt" } };
            sortKeyExpr = { $dateToString: { format: "%Y-%m",  date: "$labApprovedAt" } };
        } else if (timeline === 'thismonth') {
            // Group into "Week 1" … "Week 5"
            const weekNum = { $ceil: { $divide: [{ $dayOfMonth: "$labApprovedAt" }, 7] } };
            labelExpr   = { $concat: ["Week ", { $toString: weekNum }] };
            sortKeyExpr = { $toString: weekNum };
        } else {
            // thisweek — one bar per day, sort chronologically
            labelExpr   = { $dateToString: { format: "%d-%m-%Y", date: "$labApprovedAt" } };
            sortKeyExpr = { $dateToString: { format: "%Y-%m-%d", date: "$labApprovedAt" } };
        }

        const stats = await BOMRequest.aggregate([
            {
                $match: {
                    consumableName: { $in: materialList },
                    labApproved: true,
                    labApprovedAt: endDate
                        ? { $gte: startDate, $lt: endDate }
                        : { $gte: startDate }
                }
            },
            {
                $project: {
                    qty: 1,
                    consumableName: 1,
                    label:   labelExpr,
                    sortKey: sortKeyExpr
                }
            },
            {
                $group: {
                    _id: {
                        label:   "$label",
                        sortKey: "$sortKey",
                        material: "$consumableName"
                    },
                    totalQuantity: { $sum: "$qty" }
                }
            },
            {
                $sort: { "_id.sortKey": 1 }
            }
        ]);

        // Transform into Recharts format: [{ time: 'Week 1', Material: qty, ... }]
        const timeMap = {};
        stats.forEach(item => {
            const { label, sortKey, material } = item._id;
            if (!timeMap[sortKey]) {
                timeMap[sortKey] = { time: label, _sortKey: sortKey };
            }
            timeMap[sortKey][material] = item.totalQuantity;
        });

        const formattedStats = Object.values(timeMap)
            .sort((a, b) => a._sortKey.localeCompare(b._sortKey))
            .map(({ _sortKey, ...rest }) => rest);

        res.status(200).json({ success: true, data: formattedStats, materials: materialList });
    } catch (error) {
        console.error('Error fetching material stats:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getImpactStats = async (req, res) => {
    try {
        const { timeline } = req.query;
        let startDate;
        const now = new Date();
        const dateCopy = new Date(now);

        switch (timeline) {
            case 'today':
                startDate = new Date(dateCopy.setHours(0, 0, 0, 0));
                break;
            case 'thisweek':
                startDate = new Date(dateCopy.setDate(dateCopy.getDate() - dateCopy.getDay()));
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'thismonth':
                startDate = new Date(dateCopy.getFullYear(), dateCopy.getMonth(), 1);
                break;
            case 'thisyear':
                startDate = new Date(dateCopy.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(0);
        }

        const impactData = await BOMRequest.aggregate([
            {
                $match: {
                    labApproved: true,
                    labApprovedAt: { $gte: startDate }
                }
            },
            {
                $project: {
                    calculatedWeight: 1,
                    consumableName: 1,
                    date: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$labApprovedAt"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        date: "$date",
                        material: "$consumableName"
                    },
                    totalWeight: { $sum: "$calculatedWeight" }
                }
            }
        ]);

        // We need material energy coefficients. Fetch them all.
        const materials = await Material.find({});
        const energyMap = {};
        materials.forEach(m => energyMap[m.name] = m.embodiedEnergy);

        // Process in JS to multiply weight by energy coefficient
        const dateMap = {};
        impactData.forEach(item => {
            const date = item._id.date;
            const energy = (energyMap[item._id.material] || 0) * item.totalWeight;

            if (!dateMap[date]) dateMap[date] = { date, totalEnergy: 0 };
            dateMap[date].totalEnergy += energy;
        });

        const formattedStats = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

        res.status(200).json({ success: true, data: formattedStats });
    } catch (error) {
        console.error('Error fetching impact stats:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get all registered students with their team/guide info
const getAllStudents = async (req, res) => {
    try {
        // All students from User collection
        const allStudents = await User.find({ role: 'student' })
            .select('name email usn division batch teamId')
            .lean();

        // All teams (to map guide and problem statement)
        const teams = await Team.find({})
            .populate('guide', 'name')
            .select('members guide problemStatement')
            .lean();

        // Build a map: studentId -> { guide, problemStatement }
        const studentTeamMap = {};
        teams.forEach(team => {
            (team.members || []).forEach(memberId => {
                const id = memberId.toString();
                studentTeamMap[id] = {
                    guide: team.guide?.name || 'Unassigned',
                    problemStatement: team.problemStatement || 'N/A'
                };
            });
        });

        const enriched = allStudents.map(s => ({
            name: s.name || '',
            email: s.email || '',
            usn: s.usn || '',
            division: s.division || '',
            batch: s.batch || '',
            guide: studentTeamMap[s._id.toString()]?.guide || 'No team assigned',
            problemStatement: studentTeamMap[s._id.toString()]?.problemStatement || 'N/A'
        }));

        res.status(200).json({ success: true, data: enriched });
    } catch (error) {
        console.error('Error fetching all students:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getDashboardData,
    registerBulkStudents,
    registerBulkFaculty,
    createAdmin,
    loginAdmin,
    changePassword,
    getMaterialStats,
    getImpactStats,
    getAllStudents
};
