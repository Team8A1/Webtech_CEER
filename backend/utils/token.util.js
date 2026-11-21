const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate JWT token for authenticated user.
 *
 * FIX (JWT revocation): every token now carries a `jti` (JWT ID) — a unique
 * UUID. On logout the jti is written to the Redis denylist with a TTL equal to
 * the token's remaining lifetime. The `protect` middleware checks the denylist
 * on every request (O(1) Redis GET).
 *
 * @param {Object} user - User object from database
 * @returns {String} Signed JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    role: user.role,
    jti: uuidv4(), // unique token ID — used for denylist revocation
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  return token;
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload (includes jti and exp)
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
