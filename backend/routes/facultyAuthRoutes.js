const express = require('express');
const router = express.Router();
const { facultyLogin, facultyGoogleLogin, facultyLogout } = require('../controllers/facultyAuthController');

router.post('/login', facultyLogin);
router.post('/google-login', facultyGoogleLogin);
router.post('/logout', facultyLogout);

// Update the Google auth callback to directly authenticate existing users
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    // Exchange code for tokens and get user info
    // ...existing token exchange code...
    
    // Check if faculty exists in database
    let faculty = await Faculty.findOne({ email: userEmail });
    
    if (!faculty) {
      return res.redirect(`${process.env.FRONTEND_URL}/faculty/auth/register?email=${userEmail}`);
    }
    
    // Directly generate token and login (no approval check)
    const token = jwt.sign(
      { id: faculty._id, email: faculty.email, role: 'faculty' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.redirect(`${process.env.FRONTEND_URL}/faculty/dashboard?token=${token}`);
  } catch (error) {
    console.error('Google auth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/faculty/auth/login?error=auth_failed`);
  }
});

module.exports = router;
