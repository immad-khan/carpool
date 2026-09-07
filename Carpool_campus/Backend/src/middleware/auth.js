const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  // Stateless mock: skip JWT verification and DB lookup
  req.user = {
    _id: 'mock_user_id',
    name: 'Test User',
    email: 'mock@campus.edu',
    roles: ['rider'],
    status: 'active',
    hasCapability: () => true,
    isAdmin: () => false,
    toPublicJSON: function() { 
      return { id: this._id, name: this.name, email: this.email, roles: this.roles, verified: true };
    }
  };
  
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
