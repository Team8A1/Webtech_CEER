const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user.model');
const { generateToken } = require('../utils/token.util');

// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Traditional email/password login
 * @route POST /api/student/auth/login
 * @access Public
 */

const loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Check email domain
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || '@kletech.ac.in';
    if (!email.endsWith(allowedDomain)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${allowedDomain} email addresses are allowed.`,
      });
    }

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user has password set
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Please use Google Sign-In for this account',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.',
      });
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Generate JWT token
    const token = generateToken(user);

    // Success response
    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        token: token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          profilePicture: user.profilePicture,
          lastLogin: new Date(),
          mustChangePassword: user.mustChangePassword
        },
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: error.message,
    });
  }
};

/**
 * Verify Google ID token and authenticate user
 * @route POST /api/student/auth/google
 * @access Public
 */

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Validate input
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required',
      });
    }

    // Verify Google ID token
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

    // Extract user information from verified token
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check 1: Validate email domain (@kletech.ac.in)
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || '@kletech.ac.in';
    if (!email.endsWith(allowedDomain)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only users with ${allowedDomain} email addresses are allowed.`,
        providedEmail: email,
      });
    }

    // Check 2: Verify user exists in MongoDB database
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not registered. Please contact administrator to register your email.',
        email: email,
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.',
      });
    }

    // Update user's Google ID and profile picture if not already set
    let updateFields = {
      lastLogin: new Date(),
    };

    if (!user.googleId) {
      updateFields.googleId = googleId;
    }

    if (picture && user.profilePicture !== picture) {
      updateFields.profilePicture = picture;
    }

    // Update name if it has changed
    if (user.name !== name) {
      updateFields.name = name;
    }

    // Apply updates
    user = await User.findByIdAndUpdate(user._id, updateFields, { new: true }).select('-__v');

    // Generate JWT token
    const token = generateToken(user);

    // Success response
    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        token: token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          profilePicture: user.profilePicture,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: error.message,
    });
  }
};

/**
 * Logout user
 * @route POST /api/student/auth/logout
 * @access Public
 */
const logout = async (req, res) => {
  try {
    // FIX (JWT revocation): add the token's jti to the Redis denylist.
    // The token is now cryptographically invalid even before its natural expiry.
    // req.tokenDecoded is set by the protect middleware (jti + exp).
    const decoded = req.tokenDecoded;
    if (decoded?.jti && decoded?.exp) {
      const { revokeToken } = require('../utils/tokenDenylist.util');
      await revokeToken(decoded.jti, decoded.exp);
    }

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

/**
 * Change student password
 * @route POST /api/student/auth/change-password
 * @access Private (requires protect middleware)
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // FIX: use req.user._id from token — not req.body.email (security hole)
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    // FIX: revoke current token so the old session is dead immediately
    const decoded = req.tokenDecoded;
    if (decoded?.jti && decoded?.exp) {
      const { revokeToken } = require('../utils/tokenDenylist.util');
      await revokeToken(decoded.jti, decoded.exp);
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully. Please log in again.'
    });

  } catch (error) {
    console.error('Change Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  loginWithPassword,
  googleAuth,
  logout,
  changePassword
};
