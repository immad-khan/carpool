const express = require('express');
const controller = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const v = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth');
const { loginLimiter, otpLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/register', v.register, validate, controller.register);
router.post('/verify-email', v.verifyEmail, validate, controller.verifyEmail);
router.post('/resend-otp', otpLimiter, v.resendOtp, validate, controller.resendOtp);
router.post('/login', loginLimiter, v.login, validate, controller.login);
router.post('/refresh-token', v.refreshToken, validate, controller.refreshToken);
router.post('/forgot-password', otpLimiter, v.forgotPassword, validate, controller.forgotPassword);
router.post('/reset-password', v.resetPassword, validate, controller.resetPassword);
router.post('/logout', authenticate, v.logout, validate, controller.logout);

module.exports = router;
