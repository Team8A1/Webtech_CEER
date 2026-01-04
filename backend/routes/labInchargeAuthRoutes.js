const express = require('express');
const router = express.Router();
const { googleAuth, loginWithPassword, logout, changePassword } = require('../controllers/labInchargeAuthController');

router.post('/login', loginWithPassword);
router.post('/google', googleAuth);
router.post('/logout', logout);
router.post('/change-password', changePassword);

// Update the Google auth callback to directly authenticate existing users
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;

    // Exchange code for tokens and get user info
    // ...existing token exchange code...

    // Check if lab incharge exists in database
    let labIncharge = await LabIncharge.findOne({ email: userEmail });

    if (!labIncharge) {
      return res.redirect(`${process.env.FRONTEND_URL}/lab/auth/register?email=${userEmail}`);
    }

    // Directly generate token and login (no approval check)
    const token = jwt.sign(
      { id: labIncharge._id, email: labIncharge.email, role: 'labIncharge' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.redirect(`${process.env.FRONTEND_URL}/lab/dashboard?token=${token}`);
  } catch (error) {
    console.error('Google auth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/lab/auth/login?error=auth_failed`);
  }
});

module.exports = router;
