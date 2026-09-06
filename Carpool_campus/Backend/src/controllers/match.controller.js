const Match = require('../models/Match');
const Route = require('../models/Route');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');

// GET /matches/:matchId
async function getById(req, res) {
  const match = await Match.findById(req.params.matchId);
  if (!match) throw ApiError.notFound('Match not found');

  const [driverRoute, riderRoute] = await Promise.all([
    Route.findById(match.driverRouteId),
    Route.findById(match.riderRouteId),
  ]);

  const ownerIds = [driverRoute?.userId?.toString(), riderRoute?.userId?.toString()];
  if (!ownerIds.includes(req.user._id.toString()) && !req.user.isAdmin()) {
    throw ApiError.forbidden('Not a participant in this match');
  }

  return success(res, { data: match.toPublicJSON() });
}

module.exports = { getById };
