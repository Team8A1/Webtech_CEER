const Faculty = require('../models/Faculty');

/**
 * Register a new faculty member
 * @route POST /api/faculty/register
 * @access Public
 */
const registerFaculty = async (req, res) => {
  try {
    const { email, name, password, department, designation } = req.body;
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || '@kletech.ac.in';

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required',
      });
    }

    if (!email.endsWith(allowedDomain)) {
      return res.status(403).json({
        success: false,
        message: `Only ${allowedDomain} emails are allowed`,
      });
    }

    let faculty = await Faculty.findOne({ email: email.toLowerCase() });
    if (faculty) {
      return res.status(409).json({
        success: false,
        message: 'Faculty already registered',
      });
    }

    faculty = new Faculty({
      email: email.toLowerCase(),
      name,
      password,
      department,
      designation,
      department,
      designation,
      isActive: true,
      mustChangePassword: true,
    });
    await faculty.save();

    return res.status(201).json({
      success: true,
      message: 'Faculty registered successfully',
      faculty: {
        id: faculty._id,
        email: faculty.email,
        name: faculty.name,
        department: faculty.department,
        designation: faculty.designation,
        isActive: faculty.isActive,
      },
    });
  } catch (error) {
    console.error('Register Faculty Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = { registerFaculty };
