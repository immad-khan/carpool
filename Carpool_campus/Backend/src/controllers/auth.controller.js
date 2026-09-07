const { success, noContent } = require('../utils/apiResponse');

const MOCK_TOKEN = 'mock_jwt_token_123';

async function register(req, res) {
  const { name, email, role } = req.body;
  const mockId = 'mock_user_id_' + Date.now();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  return success(res, {
    statusCode: 201,
    data: { id: mockId, name, email, role, verified: false },
    message: `Verification OTP sent to your campus email. (MOCK OTP is: ${otp})`,
  });
}

async function verifyEmail(req, res) {
  // Stateless: Always accept whatever OTP the user inputs
  return success(res, {
    data: { id: 'mock_user_id', verified: true },
    message: 'Email verified successfully.',
  });
}

async function resendOtp(req, res) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return success(res, { message: `A new OTP has been sent. (MOCK OTP is: ${otp})` });
}

async function login(req, res) {
  const { email } = req.body;
  
  // Stateless: Always allow login for any email to bypass Vercel instances losing memory
  return success(res, {
    data: {
      accessToken: MOCK_TOKEN,
      refreshToken: MOCK_TOKEN,
      user: {
        id: 'mock_user_id',
        name: email.split('@')[0],
        email: email,
        roles: ['rider'],
        verified: true
      },
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

module.exports = {
  register,
  verifyEmail,
  resendOtp,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout,
};
