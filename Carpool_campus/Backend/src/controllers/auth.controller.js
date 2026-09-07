const { success, noContent } = require('../utils/apiResponse');

// In-memory mock DB for Vercel deployment without actual DB
const mockUsers = new Map();
const mockOtps = new Map();

const MOCK_TOKEN = 'mock_jwt_token_123';

async function register(req, res) {
  const { name, email, password, role } = req.body;
  const mockId = 'mock_user_id_' + Date.now();
  
  mockUsers.set(email.toLowerCase(), {
    _id: mockId,
    name,
    email,
    password,
    roles: [role],
    verified: false,
    toPublicJSON: function() { 
      return { id: this._id, name: this.name, email: this.email, roles: this.roles, verified: this.verified };
    }
  });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  mockOtps.set(email.toLowerCase(), otp);

  return success(res, {
    statusCode: 201,
    data: {
      id: mockId,
      name,
      email,
      role,
      verified: false,
    },
    message: `Verification OTP sent to your campus email. (MOCK OTP is: ${otp})`,
  });
}

async function verifyEmail(req, res) {
  const { email, otp } = req.body;
  const user = mockUsers.get(email.toLowerCase());
  
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
  }
  if (mockOtps.get(email.toLowerCase()) !== otp) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid OTP' } });
  }

  user.verified = true;
  mockOtps.delete(email.toLowerCase());

  return success(res, {
    data: { id: user._id, verified: true },
    message: 'Email verified successfully.',
  });
}

async function resendOtp(req, res) {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  mockOtps.set(email.toLowerCase(), otp);
  return success(res, { message: `A new OTP has been sent. (MOCK OTP is: ${otp})` });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = mockUsers.get(email.toLowerCase());

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } });
  }
  if (!user.verified) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Account not verified' } });
  }

  return success(res, {
    data: {
      accessToken: MOCK_TOKEN,
      refreshToken: MOCK_TOKEN,
      user: user.toPublicJSON(),
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
