const Trip = require('../models/Trip');
const Match = require('../models/Match');
const Route = require('../models/Route');
const ApiError = require('./ApiError');

async function loadTripContext(tripId) {
  const trip = await Trip.findById(tripId);
  if (!trip) throw ApiError.notFound('Trip not found');

  const match = await Match.findById(trip.matchId);
  if (!match) throw ApiError.notFound('Associated match not found');

  const [driverRoute, riderRoute] = await Promise.all([
    Route.findById(match.driverRouteId),
    Route.findById(match.riderRouteId),
  ]);

  return { trip, match, driverRoute, riderRoute };
}

module.exports = { loadTripContext };