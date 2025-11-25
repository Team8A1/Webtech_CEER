const { OAuth2Client } = require('google-auth-library');

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

    const faculty = await Faculty.findOne({ email: email.toLowerCase() }).select('+password');

    if (!faculty) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!faculty.password) {
      return res.status(401).json({
        success: false,
        message: 'Please use Google Sign-In for this account',
      });
    }

    const isPasswordValid = await faculty.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!faculty.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.',
      });
    }

    await Faculty.findByIdAndUpdate(faculty._id, { lastLogin: new Date() });

    const token = generateToken({ id: faculty._id, email: faculty.email, role: 'faculty' });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        token: token,
        user: {
          id: faculty._id,
          email: faculty.email,
          name: faculty.name,
          role: 'faculty',
          profilePicture: faculty.profilePicture,
          department: faculty.department,
          designation: faculty.designation,
          lastLogin: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Faculty Login Error:', error);
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

    let faculty = await Faculty.findOne({ email: email.toLowerCase() });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not registered. Please contact administrator to register your email.',
        email: email,
      });
    }

    if (!faculty.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.',
      });
    }

    let updateFields = {
      lastLogin: new Date(),
    };

    if (!faculty.googleId) {
      updateFields.googleId = googleId;
    }

    if (!faculty.profilePicture && picture) {
      updateFields.profilePicture = picture;
    }

    if (faculty.name !== name) {
      updateFields.name = name;
    }

    faculty = await Faculty.findByIdAndUpdate(faculty._id, updateFields, { new: true }).select('-__v');

    const token = generateToken({ id: faculty._id, email: faculty.email, role: 'faculty' });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        token: token,
        user: {
          id: faculty._id,
          email: faculty.email,
          name: faculty.name,
          role: 'faculty',
          profilePicture: faculty.profilePicture,
          department: faculty.department,
          designation: faculty.designation,
          lastLogin: faculty.lastLogin,
        },
      },
    });
  } catch (error) {
    console.error('Faculty Google Auth Error:', error);
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