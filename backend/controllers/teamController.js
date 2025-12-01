const Team = require('../models/Team');
const User = require('../models/User');
const Faculty = require('../models/Faculty');

/**
 * Create a new team
 * @route POST /api/faculty/team/create
 * @access Private (Faculty only)
 */
const createTeam = async (req, res) => {
    try {
        const { teamName, problemStatement, members } = req.body;
        const guideId = req.user.id; // From auth middleware

        // Validate input
        if (!problemStatement || !members || members.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Problem statement and at least one member are required',
            });
        }

        // Verify all students exist and are not in a team
        const students = await User.find({ _id: { $in: members } });

        if (students.length !== members.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more students not found',
            });
        }

        const alreadyInTeam = students.filter(s => s.teamId);
        if (alreadyInTeam.length > 0) {
            const names = alreadyInTeam.map(s => s.name).join(', ');
            return res.status(400).json({
                success: false,
                message: `The following students are already in a team: ${names}`,
            });
        }

        // Create team
        const team = new Team({
            teamName,
            problemStatement,
            members,
            guide: guideId,
        });

        await team.save();

        // Update students
        await User.updateMany(
            { _id: { $in: members } },
            {
                $set: {
                    teamId: team._id,
                    problemStatement: problemStatement,
                    guideId: guideId,
                },
            }
        );

        return res.status(201).json({
            success: true,
            message: 'Team created successfully',
            team,
        });
    } catch (error) {
        console.error('Create Team Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

/**
 * Get teams created by the logged-in faculty
 * @route GET /api/faculty/team/list
 * @access Private (Faculty only)
 */
const getFacultyTeams = async (req, res) => {
    try {
        const guideId = req.user.id;
        const teams = await Team.find({ guide: guideId }).populate('members', 'name email usn');

        return res.status(200).json({
            success: true,
            teams,
        });
    } catch (error) {
        console.error('Get Faculty Teams Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

/**
 * Get available students (not in any team)
 * @route GET /api/faculty/team/students
 * @access Private (Faculty only)
 */
const getAvailableStudents = async (req, res) => {
    try {
        const students = await User.find({
            role: 'student',
            teamId: { $exists: false }
        }).select('name email');

        return res.status(200).json({
            success: true,
            students,
        });
    } catch (error) {
        console.error('Get Available Students Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

/**
 * Get team details for the logged-in student
 * @route GET /api/student/team/details
 * @access Private (Student only)
 */
const getStudentTeam = async (req, res) => {
    try {
        const studentId = req.user.id;
        const student = await User.findById(studentId).populate('teamId');

        if (!student.teamId) {
            return res.status(200).json({
                success: true,
                team: null,
                message: 'Not assigned to any team',
            });
        }

        const team = await Team.findById(student.teamId)
            .populate('members', 'name email')
            .populate('guide', 'name email department');

        return res.status(200).json({
            success: true,
            team,
        });
    } catch (error) {
        console.error('Get Student Team Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

module.exports = {
    createTeam,
    getFacultyTeams,
    getAvailableStudents,
    getStudentTeam,
};
