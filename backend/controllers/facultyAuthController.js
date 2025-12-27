const Faculty = require('../models/Faculty');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const facultyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find faculty by email
    const faculty = await Faculty.findOne({ email }).select('+password');
    if (!faculty) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await faculty.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if faculty is approved
    if (!faculty.isApproved) {
      return res.status(403).json({ message: 'Your account is pending approval' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: faculty._id, email: faculty.email, role: 'faculty' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        role: 'faculty',
        mustChangePassword: faculty.mustChangePassword
      }
    });
  } catch (error) {
    console.error('Faculty login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const facultyGoogleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    console.log('Google login attempt:', { hasCredential: !!credential });

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Check if GOOGLE_CLIENT_ID is configured
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID is not configured in environment variables');
      return res.status(500).json({ message: 'Google authentication is not configured' });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const googleId = payload.sub;

    console.log('Google auth successful for:', email);

    // Find or create faculty
    let faculty = await Faculty.findOne({ email });

    if (!faculty) {
      // Create new faculty with Google auth
      faculty = new Faculty({
        name,
        email,
        googleId,
        isApproved: false, // New faculty needs approval
        department: 'Not Specified' // Can be updated later
      });
      await faculty.save();

      return res.status(403).json({
        message: 'Account created. Please wait for admin approval.',
        needsApproval: true
      });
    }

    // Check if faculty is approved
    if (!faculty.isApproved) {
      return res.status(403).json({ message: 'Your account is pending approval' });
    }

    // Update googleId if not set
    if (!faculty.googleId) {
      faculty.googleId = googleId;
      await faculty.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: faculty._id, email: faculty.email, role: 'faculty' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        role: 'faculty',
        mustChangePassword: faculty.mustChangePassword
      }
    });
  } catch (error) {
    console.error('Faculty Google login error:', error);

    // Provide more specific error messages
    if (error.message && error.message.includes('Invalid token')) {
      return res.status(401).json({ message: 'Invalid Google token. Please try again.' });
    }

    if (error.message && error.message.includes('Token used too late')) {
      return res.status(401).json({ message: 'Google token expired. Please try again.' });
    }

    res.status(500).json({
      message: 'Server error during Google login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const facultyLogout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can add token to a blacklist if needed in the future
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Faculty logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, current password, and new password are required'
      });
    }

    const faculty = await Faculty.findOne({ email }).select('+password');
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Verify old password
    const isMatch = await faculty.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect current password'
      });
    }

    // Update password
    faculty.password = newPassword;
    faculty.mustChangePassword = false;
    await faculty.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  facultyLogin,
  facultyGoogleLogin,
  facultyLogout,
  changePassword
};