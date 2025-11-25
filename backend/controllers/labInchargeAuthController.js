const { OAuth2Client } = require('google-auth-library');
const LabIncharge = require('../models/LabIncharge');
const { generateToken } = require('../utils/tokenUtils');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || '@kletech.ac.in';
    if (!email.endsWith(allowedDomain)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${allowedDomain} email addresses are allowed.`,
      });
    }

    const labIncharge = await LabIncharge.findOne({ email: email.toLowerCase() }).select('+password');

    if (!labIncharge) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!labIncharge.password) {
      return res.status(401).json({
        success: false,
        message: 'Please use Google Sign-In for this account',
      });
    }

    const isPasswordValid = await labIncharge.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!labIncharge.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.',
      });
    }

    await LabIncharge.findByIdAndUpdate(labIncharge._id, { lastLogin: new Date() });

    const token = generateToken({ id: labIncharge._id, email: labIncharge.email, role: 'labIncharge' });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        token: token,
        user: {
          id: labIncharge._id,
          email: labIncharge.email,
          name: labIncharge.name,
          role: 'labIncharge',
          profilePicture: labIncharge.profilePicture,
          labName: labIncharge.labName,
          lastLogin: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Lab Incharge Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: error.message,
    });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required',
      });
    }

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      console.error('Google token verification failed:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid Google ID token',
        error: error.message,
      });
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || '@kletech.ac.in';
    if (!email.endsWith(allowedDomain)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only users with ${allowedDomain} email addresses are allowed.`,
        providedEmail: email,
      });
    }

    let labIncharge = await LabIncharge.findOne({ email: email.toLowerCase() });

    if (!labIncharge) {
      return res.status(404).json({
        success: false,
        message: 'Lab Incharge not registered. Please contact administrator to register your email.',
        email: email,
      });
    }

    if (!labIncharge.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.',
      });
    }

    let updateFields = {
      lastLogin: new Date(),
    };

    if (!labIncharge.googleId) {
      updateFields.googleId = googleId;
    }

    if (!labIncharge.profilePicture && picture) {
      updateFields.profilePicture = picture;
    }

    if (labIncharge.name !== name) {
      updateFields.name = name;
    }

    labIncharge = await LabIncharge.findByIdAndUpdate(labIncharge._id, updateFields, { new: true }).select('-__v');

    const token = generateToken({ id: labIncharge._id, email: labIncharge.email, role: 'labIncharge' });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        token: token,
        user: {
          id: labIncharge._id,
          email: labIncharge.email,
          name: labIncharge.name,
          role: 'labIncharge',
          profilePicture: labIncharge.profilePicture,
          labName: labIncharge.labName,
          lastLogin: labIncharge.lastLogin,
        },
      },
    });
  } catch (error) {
    console.error('Lab Incharge Google Auth Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
      error: error.message,
    });
  }
};

module.exports = {
  loginWithPassword,
  googleAuth,
  logout,
};
