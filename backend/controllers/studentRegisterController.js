const User = require('../models/User');

/**
 * Register a new student
 * @route POST /api/student/register
 * @access Public
 */
const registerStudent = async (req, res) => {
  try {
    const { email, name, password, division } = req.body;
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || '@kletech.ac.in';

    // Validate input
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required',
      });
    }

    // Check email domain
    if (!email.endsWith(allowedDomain)) {
      return res.status(403).json({
        success: false,
        message: `Only ${allowedDomain} emails are allowed`,
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(409).json({
        success: false,
        message: 'User already registered',
      });
    }

    // Create new user (with optional password)
    user = new User({
      email: email.toLowerCase(),
      name,
      division: division ? division.toUpperCase() : undefined,
      password: password || 'Student@123',
      role: 'student',
      mustChangePassword: true,
      isActive: true,
    });
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Register Student Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = { registerStudent };
