const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 * Prevents a single IP from spamming the API
 */
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: `Too many requests from this IP, please try again after ${windowMs / 60 / 1000} minutes`
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Authentication Rate Limiter
 * Stricter limits for login and registration to prevent brute-force attacks
 */
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 10 requests per windowMs (login/register/password change)
    message: {
        success: false,
        message: `Too many authentication attempts, please try again after ${windowMs / 60 / 1000} minutes`
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    authLimiter
};
