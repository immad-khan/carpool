const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { success, noContent } = require('../utils/apiResponse');
const { signAccessToken, signRefreshToken, verifyRefreshToken, expiresInToSeconds } = require('../utils/jwt');
const { generateOtp, storeOtp, getOtp, clearOtp, isInResendCooldown, setResendCooldown } = require('../utils/otp');
const { sendOtpEmail } = require('../config/mailer');
const { getRedis } = require('../config/redis');

function approvedDomains() {
  return (process.env.APPROVED_EMAIL_DOMAINS || '')
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

function isApprovedDomain(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  const approved = approvedDomains();
  if (approved.length === 0) return true; // no restriction configured
  return approved.includes(domain);
}

function refreshTokenSetKey(userId) {
  return `refreshTokens:${userId}`;
}

async function issueTokenPair(user) {
  const payload = { sub: user._id.toString(), roles: user.roles };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const redis = getRedis();
  const ttlSeconds = expiresInToSeconds(process.env.JWT_REFRESH_EXPIRES_IN || '7d');
  await redis.sadd(refreshTokenSetKey(user._id.toString()), refreshToken);
  await redis.expire(refreshTokenSetKey(user._id.toString()), ttlSeconds);

  return { accessToken, refreshToken };
}

// POST /auth/register
async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (!isApprovedDomain(email)) {
    throw ApiError.unprocessable('Email domain is not an approved campus domain');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('Email already registered');

  const user = await User.create({ name, email, password, roles: [role] });

  const otp = generateOtp();
  await storeOtp('email_verification', user.email, otp);
  await sendOtpEmail(user.email, otp, 'email_verification');

  return success(res, {
    statusCode: 201,
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.roles[0],
      verified: user.verified,
    },
    message: 'Verification OTP sent to your campus email.',
  });
}

// POST /auth/verify-email
async function verifyEmail(req, res) {
  const { email, otp } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw ApiError.notFound('No pending OTP / user not found');

  const stored = await getOtp('email_verification', user.email);
  if (!stored) throw ApiError.gone('OTP expired');
  if (stored !== otp) throw ApiError.unauthorized('OTP incorrect');

  user.verified = true;
  await user.save();
  await clearOtp('email_verification', user.email);

  return success(res, {
    data: { id: user._id.toString(), verified: user.verified },
    message: 'Email verified successfully.',
  });
}

// POST /auth/resend-otp
async function resendOtp(req, res) {
  const { email, purpose } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw ApiError.notFound('Account not found');

  if (await isInResendCooldown(purpose, user.email)) {
    throw ApiError.tooMany('Please wait before requesting another OTP.');
  }

  const otp = generateOtp();
  await storeOtp(purpose, user.email, otp);
  await setResendCooldown(purpose, user.email);
  await sendOtpEmail(user.email, otp, purpose);

  return success(res, { message: 'A new OTP has been sent.' });
}

// POST /auth/login
async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const match = await user.comparePassword(password);
  if (!match) throw ApiError.unauthorized('Invalid email or password');

  if (!user.verified) throw ApiError.forbidden('Account not verified');
  if (user.status === 'suspended') throw ApiError.forbidden('Account is suspended');

  const { accessToken, refreshToken } = await issueTokenPair(user);

  return success(res, {
    data: {
      accessToken,
      refreshToken,
      user: user.toPublicJSON(),
    },
  });
}

// POST /auth/refresh-token
async function refreshToken(req, res) {
  const { refreshToken: token } = req.body;

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Refresh token invalid or expired');
  }

  const redis = getRedis();
  const isMember = await redis.sismember(refreshTokenSetKey(payload.sub), token);
  if (!isMember) throw ApiError.unauthorized('Refresh token has been revoked');

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('User no longer exists');

  const accessToken = signAccessToken({ sub: user._id.toString(), roles: user.roles });

  return success(res, { data: { accessToken } });
}

// POST /auth/forgot-password
async function forgotPassword(req, res) {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  // Always 200 to avoid account enumeration, per API.md.
  if (user) {
    if (!(await isInResendCooldown('password_reset', user.email))) {
      const otp = generateOtp();
      await storeOtp('password_reset', user.email, otp);
      await setResendCooldown('password_reset', user.email);
      await sendOtpEmail(user.email, otp, 'password_reset');
    }
  }

  return success(res, { message: 'Password reset OTP sent if the account exists.' });
}

// POST /auth/reset-password
async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw ApiError.unauthorized('OTP incorrect');

  const stored = await getOtp('password_reset', user.email);
  if (!stored) throw ApiError.gone('OTP expired');
  if (stored !== otp) throw ApiError.unauthorized('OTP incorrect');

  user.password = newPassword;
  await user.save();
  await clearOtp('password_reset', user.email);

  // Revoke all existing refresh tokens on password reset.
  const redis = getRedis();
  await redis.del(refreshTokenSetKey(user._id.toString()));

  return success(res, { message: 'Password reset successfully.' });
}

// POST /auth/logout
async function logout(req, res) {
  const { refreshToken: token } = req.body;
  const redis = getRedis();
  await redis.srem(refreshTokenSetKey(req.user._id.toString()), token);
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
