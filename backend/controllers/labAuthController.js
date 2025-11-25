const LabIncharge = require('../models/LabIncharge');
const { generateToken } = require('../utils/jwt');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const labLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const labIncharge = await LabIncharge.findOne({ email });
    if (!labIncharge) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await labIncharge.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(labIncharge._id, 'labincharge', labIncharge.email, labIncharge.name);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token,
      user: {
        id: labIncharge._id,
        email: labIncharge.email,
        name: labIncharge.name,
        role: 'labincharge'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const labGoogleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let labIncharge = await LabIncharge.findOne({ email });

    if (!labIncharge) {
      labIncharge = await LabIncharge.create({
        email,
        name,
        googleId,
        authProvider: 'google'
      });
    }

    const token = generateToken(labIncharge._id, 'labincharge', labIncharge.email, labIncharge.name);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token,
      user: {
        id: labIncharge._id,
        email: labIncharge.email,
        name: labIncharge.name,
        role: 'labincharge'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Google authentication failed' });
  }
};

const labLogout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = { labLogin, labGoogleLogin, labLogout };
