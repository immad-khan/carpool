const { body } = require('express-validator');

const register = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('email').isEmail().withMessage('email must be valid').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 characters (min length TBD, recommend 8+ mixed case)'),
  body('role').isIn(['driver', 'rider']).withMessage('role must be driver or rider'),
];

const verifyEmail = [
  body('email').isEmail().withMessage('email must be valid').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('otp must be a 6-digit code'),
];

const resendOtp = [
  body('email').isEmail().withMessage('email must be valid').normalizeEmail(),
  body('purpose').isIn(['email_verification', 'password_reset']).withMessage('invalid purpose'),
];

const login = [
  body('email').isEmail().withMessage('email must be valid').normalizeEmail(),
  body('password').notEmpty().withMessage('password is required'),
];

const refreshToken = [body('refreshToken').notEmpty().withMessage('refreshToken is required')];

const forgotPassword = [body('email').isEmail().withMessage('email must be valid').normalizeEmail()];

const resetPassword = [
  body('email').isEmail().withMessage('email must be valid').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('otp must be a 6-digit code'),
  body('newPassword').isLength({ min: 8 }).withMessage('newPassword must be at least 8 characters'),
];

const logout = [body('refreshToken').notEmpty().withMessage('refreshToken is required')];

module.exports = { register, verifyEmail, resendOtp, login, refreshToken, forgotPassword, resetPassword, logout };
