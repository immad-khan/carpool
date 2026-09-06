const Match = require('../models/Match');
const Trip = require('../models/Trip');

// Every other non-cancelled Trip whose Match shares this driver's route — i.e. every
// other rider currently sharing this driver's recurring run. See Module 10/11 doc notes
// on why this groups by driverRouteId alone rather than matching Trip.date exactly.
async function findSiblingTrips(driverRouteId) {
  const siblingMatches = await Match.find({ driverRouteId }).select('_id');
  const siblingMatchIds = siblingMatches.map((m) => m._id);

  return Trip.find({
    matchId: { $in: siblingMatchIds },
    status: { $ne: 'cancelled' },
  });
}

module.exports = { findSiblingTrips };