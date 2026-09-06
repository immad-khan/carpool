const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

function makeLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(ApiError.tooMany(message || 'Too many requests, please try again later.'));
    },
  });
}

// Coarse IP-based limiters per API.md §1.12 (exact thresholds TBD).
const loginLimiter = makeLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many login attempts. Try again later.' });
const otpLimiter = makeLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many OTP requests. Try again later.' });

module.exports = { loginLimiter, otpLimiter };
