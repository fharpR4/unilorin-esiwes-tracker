const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter.
 * Applies to all routes — prevents abuse and DDoS.
 * 100 requests per 15 minutes per IP.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please wait 15 minutes before trying again.',
  },
});

/**
 * Strict auth rate limiter.
 * Applied only to login, register, and password reset endpoints.
 * 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
  },
  skipSuccessfulRequests: true,
});

/**
 * Password reset specific limiter.
 * 5 requests per hour per IP.
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests. Please wait 1 hour before trying again.',
  },
});

module.exports = { generalLimiter, authLimiter, passwordResetLimiter };