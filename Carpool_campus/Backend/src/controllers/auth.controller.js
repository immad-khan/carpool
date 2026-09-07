const { success, noContent } = require('../utils/apiResponse');
const { MOCK_USER_ID, MOCK_USER } = require('../mock/store');

const MOCK_TOKEN = 'mock_jwt_token_123';

async function register(req, res) {
  const { name, email, role } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return success(res, {
    statusCode: 201,
    data: { id: MOCK_USER_ID, name, email, role, verified: false },
    message: `Verification OTP sent to your campus email. (MOCK OTP is: ${otp})`,
  });
}

async function verifyEmail(req, res) {
  // Stateless: accept any OTP
  return success(res, { data: { id: MOCK_USER_ID, verified: true }, message: 'Email verified successfully.' });
}

async function resendOtp(req, res) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return success(res, { message: `A new OTP has been sent. (MOCK OTP is: ${otp})` });
}

async function login(req, res) {
  const { email } = req.body;
  const user = { ...MOCK_USER, email: email || MOCK_USER.email, name: (email || '').split('@')[0] || MOCK_USER.name };
  return success(res, {
    data: {
      accessToken: MOCK_TOKEN,
      refreshToken: MOCK_TOKEN,
      user: { id: user.id, name: user.name, email: user.email, roles: user.roles, verified: true },
    },
  });
}

async function refreshToken(req, res) {
  return success(res, { data: { accessToken: MOCK_TOKEN } });
}

async function forgotPassword(req, res) {
  return success(res, { message: 'Password reset OTP sent if the account exists.' });
}

async function resetPassword(req, res) {
  return success(res, { message: 'Password reset successfully.' });
}

async function logout(req, res) {
  return noContent(res);
}

module.exports = { register, verifyEmail, resendOtp, login, refreshToken, forgotPassword, resetPassword, logout };
