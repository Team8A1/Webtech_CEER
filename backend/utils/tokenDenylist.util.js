const { createRedisConnection } = require('../config/redis.config');

/**
 * Token Denylist — Redis-backed JWT revocation.
 *
 * Problem: JWTs are stateless — once issued they're valid until expiry.
 * If a user logs out or an admin deactivates an account, the token keeps working.
 *
 * Solution: Store the token's `jti` (unique ID) in Redis with a TTL equal to
 * the token's remaining lifetime. The `protect` middleware checks this denylist
 * on every request — O(1) Redis GET, no DB hit.
 *
 * Key format:  denylist:<jti>
 * Value:       '1'  (we only care about existence, not the value)
 * TTL:         seconds until the token expires
 */

let _redis = null;

const getRedis = () => {
  if (!_redis) {
    _redis = createRedisConnection();
    _redis.on('error', (err) => {
      console.error('[TokenDenylist] Redis error:', err.message);
    });
  }
  return _redis;
};

const DENYLIST_PREFIX = 'denylist:';

/**
 * Revoke a JWT by adding its jti to the denylist.
 * @param {string} jti  - Token's unique ID (from decoded.jti)
 * @param {number} exp  - Token expiry timestamp in seconds (from decoded.exp)
 */
const revokeToken = async (jti, exp) => {
  if (!jti || !exp) return;
  const ttl = exp - Math.floor(Date.now() / 1000);
  if (ttl <= 0) return; // already expired — no need to store
  try {
    await getRedis().set(`${DENYLIST_PREFIX}${jti}`, '1', 'EX', ttl);
  } catch (err) {
    console.error('[TokenDenylist] Failed to revoke token:', err.message);
    // Don't throw — worst case the token stays valid until natural expiry
  }
};

/**
 * Check if a JWT has been revoked.
 * @param {string} jti
 * @returns {Promise<boolean>} true = revoked (deny request)
 */
const isTokenRevoked = async (jti) => {
  if (!jti) return false;
  try {
    const result = await getRedis().exists(`${DENYLIST_PREFIX}${jti}`);
    return result === 1;
  } catch (err) {
    console.error('[TokenDenylist] Redis check failed:', err.message);
    // Fail open — if Redis is down, don't lock everyone out
    return false;
  }
};

module.exports = { revokeToken, isTokenRevoked };
