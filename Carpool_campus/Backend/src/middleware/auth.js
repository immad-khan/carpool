const ApiError = require('../utils/ApiError');
const { MOCK_USER } = require('../mock/store');

async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  // Stateless mock: skip JWT verification and DB lookup entirely
  req.user = {
    ...MOCK_USER,
    // Clone methods so they work correctly
    toPublicJSON: MOCK_USER.toPublicJSON.bind(MOCK_USER),
    toLimitedPublicJSON: MOCK_USER.toLimitedPublicJSON.bind(MOCK_USER),
    hasCapability: () => true,
    isAdmin: () => false,
    save: async function() { return this; },
  };

  next();
}

function requireCapability(role) {
  return (req, res, next) => {
    // Always pass in mock mode
    next();
  };
}

function requireAdmin(req, res, next) {
  // Always pass in mock mode
  next();
}

module.exports = { authenticate, requireCapability, requireAdmin };
