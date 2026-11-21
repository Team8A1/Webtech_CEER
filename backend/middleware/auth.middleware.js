const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/token.util');
const { isTokenRevoked } = require('../utils/tokenDenylist.util');
const User = require('../models/user.model');
const Faculty = require('../models/faculty.model');
const LabIncharge = require('../models/labIncharge.model');
const Admin = require('../models/admin.model');

/**
 * Middleware to protect routes - verifies JWT token from Authorization Header or Cookies
 * and attaches the authenticated database user to req.user
 *
 * FIX (JWT revocation): checks Redis denylist for the token's jti before accepting it.
 * FIX (rate limiting key): attaches req.rateLimitKey = userId so the user-keyed
 * API limiter can identify callers regardless of their IP/NAT.
 */
const protect = async (req, res, next) => {
  try {
    // 1. Get token from Header or Cookies
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required, no token provided'
      });
    }

    // 2. Verify token signature + expiry
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token verification failed'
      });
    }

    // 3. FIX: Check denylist — was this token explicitly revoked (logout/deactivation)?
    if (decoded.jti) {
      const revoked = await isTokenRevoked(decoded.jti);
      if (revoked) {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.'
        });
      }
    }

    // 4. Get user from DB based on role in the token
    let user;
    if (decoded.role === 'faculty') {
      user = await Faculty.findById(decoded.id || decoded.userId).select('-password');
    } else if (decoded.role === 'labIncharge' || decoded.role === 'labincharge') {
      user = await LabIncharge.findById(decoded.id || decoded.userId).select('-password');
      if (user) user.role = 'labIncharge'; // Normalize casing
    } else if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id || decoded.userId).select('-password');
    } else if (decoded.role === 'student') {
      user = await User.findById(decoded.id || decoded.userId).select('-password');
    } else {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid role in token'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive'
      });
    }

    req.user = user;

    // FIX (college WiFi NAT): expose user ID as the rate-limit key so the
    // user-keyed API limiter identifies callers by identity, not shared IP.
    req.rateLimitKey = user._id.toString();

    // Also store decoded for logout handler (needs jti + exp to revoke)
    req.tokenDecoded = decoded;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token verification failed'
    });
  }
};

/**
 * Middleware to check user role
 * @param  {...String} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user details missing'
      });
    }

    // Normalize roles search (handles labIncharge vs labincharge casing mismatches)
    const userRoleNormalized = req.user.role === 'labincharge' ? 'labIncharge' : req.user.role;
    const allowedRolesNormalized = roles.map(r => r === 'labincharge' ? 'labIncharge' : r);

    if (!allowedRolesNormalized.includes(userRoleNormalized)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
