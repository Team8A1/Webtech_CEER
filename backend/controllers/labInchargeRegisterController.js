const LabIncharge = require('../models/LabIncharge');

/**
 * Register a new lab incharge
 * @route POST /api/lab/register
 * @access Public
 */
const registerLabIncharge = async (req, res) => {
  try {
    const { email, name, password, labName } = req.body;
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

    let labIncharge = await LabIncharge.findOne({ email: email.toLowerCase() });
    if (labIncharge) {
      return res.status(409).json({
        success: false,
        message: 'Lab Incharge already registered',
      });
    }

    labIncharge = new LabIncharge({
      email: email.toLowerCase(),
      name,
      password,
      labName,
      isActive: true,
    });
    await labIncharge.save();

    return res.status(201).json({
      success: true,
      message: 'Lab Incharge registered successfully',
      labIncharge: {
        id: labIncharge._id,
        email: labIncharge.email,
        name: labIncharge.name,
        labName: labIncharge.labName,
        isActive: labIncharge.isActive,
      },
    });
  } catch (error) {
    console.error('Register Lab Incharge Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = { registerLabIncharge };
