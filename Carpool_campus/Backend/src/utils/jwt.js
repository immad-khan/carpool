const jwt = require('jsonwebtoken');

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

// Rough seconds conversion for Redis TTL, supports formats like '15m', '7d', '3600'
function expiresInToSeconds(value) {
  if (/^\d+$/.test(value)) return Number(value);
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) return 3600;
  const num = Number(match[1]);
  const unit = match[2];
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return num * multipliers[unit];
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  expiresInToSeconds,
};
