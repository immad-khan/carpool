const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Access token is invalid or expired');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (user.status === 'suspended') throw ApiError.forbidden('Account is suspended');

  req.user = user;
  next();
}

function requireCapability(role) {
  return (req, res, next) => {
    if (!req.user.hasCapability(role)) {
      throw ApiError.forbidden(`Requires ${role} capability`);
    }
    next();
  };
}

function requireAdmin(req, res, next) {
  if (!req.user.isAdmin()) throw ApiError.forbidden('Admin access required');
  next();
}

module.exports = { authenticate, requireCapability, requireAdmin };
