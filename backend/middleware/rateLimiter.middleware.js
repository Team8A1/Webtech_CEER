const rateLimit = require('express-rate-limit');

// ─── Shared key generator helpers ─────────────────────────────────────────────

/**
 * Extract the real client IP, stripping proxy hops.
 * Used only for PUBLIC (unauthenticated) routes like /login.
 */
const ipKey = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;

/**
 * FIX (College WiFi / NAT problem):
 * On authenticated routes ALL students behind the same campus WiFi share ONE
 * public IP — so IP-based limiting would block the entire college after one
 * student hits the threshold.
 *
 * Solution: use `req.rateLimitKey` (the authenticated user's MongoDB _id),
 * set by the `protect` middleware. Each student gets their own independent
 * counter, regardless of which IP they're coming from.
 *
 * Falls back to IP if the user is not yet authenticated (shouldn't happen on
 * protected routes, but safe to guard).
 */
const userKey = (req) => req.rateLimitKey || ipKey(req);

// ─── Limiters ─────────────────────────────────────────────────────────────────

/**
 * General API Rate Limiter — keyed by USER ID (not IP).
 * Applied to all /api/* routes AFTER the protect middleware runs.
 * Each authenticated user gets 200 requests/min independently.
 */
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200,                  // raised from 100 — per-user, not per-IP
    message: {
        success: false,
        message: 'You are sending too many requests. Please slow down and try again in a minute.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userKey,     // FIX: per-user, not per-IP
});

/**
 * Authentication Rate Limiter — still IP-based (users are NOT authenticated yet).
 *
 * This is the ONLY place IP-based limiting makes sense: brute-force login
 * attacks come from one IP trying many passwords. Even in a college NAT,
 * 10 failed login attempts per 15 min per IP is generous enough for legit use.
 *
 * `skipSuccessfulRequests: true` — successful logins don't count against limit.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        success: false,
        message: 'Too many failed login attempts from this network. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: ipKey,       // IP is correct here — user isn't authenticated yet
});

module.exports = {
    apiLimiter,
    authLimiter
};
