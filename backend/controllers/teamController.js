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
        }).select('name email division').sort({ division: 1, name: 1 });

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

/**
 * Update an existing team
 * @route PUT /api/faculty/team/update/:teamId
 * @access Private (Faculty only)
 */
const updateTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { problemStatement, members, teamName } = req.body;
        const guideId = req.user.id;

        // Find the team and verify ownership
        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found',
            });
        }

        // Verify the faculty is the guide of this team
        if (team.guide.toString() !== guideId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to edit this team',
            });
        }

        // Get current team members
        const currentMembers = team.members.map(m => m.toString());
        const newMembers = members || currentMembers;

        // Find students being removed
        const removedMembers = currentMembers.filter(m => !newMembers.includes(m));

        // Find students being added
        const addedMembers = newMembers.filter(m => !currentMembers.includes(m));

        // Verify new students exist and are not in another team
        if (addedMembers.length > 0) {
            const studentsToAdd = await User.find({ _id: { $in: addedMembers } });

            if (studentsToAdd.length !== addedMembers.length) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more students not found',
                });
            }

            const alreadyInTeam = studentsToAdd.filter(s => s.teamId && s.teamId.toString() !== teamId);
            if (alreadyInTeam.length > 0) {
                const names = alreadyInTeam.map(s => s.name).join(', ');
                return res.status(400).json({
                    success: false,
                    message: `The following students are already in another team: ${names}`,
                });
            }
        }

        // Update the team
        team.problemStatement = problemStatement || team.problemStatement;
        team.members = newMembers;
        if (teamName) team.teamName = teamName;

        await team.save();

        // Remove team reference from removed students
        if (removedMembers.length > 0) {
            await User.updateMany(
                { _id: { $in: removedMembers } },
                {
                    $unset: {
                        teamId: '',
                        problemStatement: '',
                        guideId: '',
                    },
                }
            );
        }

        // Add team reference to newly added students
        if (addedMembers.length > 0) {
            await User.updateMany(
                { _id: { $in: addedMembers } },
                {
                    $set: {
                        teamId: team._id,
                        problemStatement: team.problemStatement,
                        guideId: guideId,
                    },
                }
            );
        }

        // Update problem statement for all current members
        await User.updateMany(
            { _id: { $in: newMembers } },
            {
                $set: {
                    problemStatement: team.problemStatement,
                },
            }
        );

        // Fetch updated team with populated members
        const updatedTeam = await Team.findById(teamId).populate('members', 'name email usn');

        return res.status(200).json({
            success: true,
            message: 'Team updated successfully',
            team: updatedTeam,
        });
    } catch (error) {
        console.error('Update Team Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

module.exports = {
    createTeam,
    getFacultyTeams,
    getAvailableStudents,
    getStudentTeam,
    updateTeam,
};
