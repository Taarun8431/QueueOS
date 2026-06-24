const rateLimit = require("express-rate-limit");

/**
 * Strict limiter for auth endpoints (login, register, refresh).
 * Prevents brute force attacks on passwords and token theft.
 * 5 attempts per 15 minutes per IP.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: {
        success: false,
        message: "Too many attempts. Please try again after 15 minutes.",
    },
    standardHeaders: true,  
    legacyHeaders: false,
});

/**
 * General limiter for all other API routes.
 * Prevents scraping and DDoS.
 * 100 requests per 15 minutes per IP.
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests. Please slow down.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter, generalLimiter };
