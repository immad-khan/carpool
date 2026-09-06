const Trip = require('../models/Trip');
const Match = require('../models/Match');
const Route = require('../models/Route');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const { haversineKm } = require('../utils/matching');
const { assertParticipant, assertDriverOwner } = require('../utils/participants');
const { findSiblingTrips } = require('../utils/tripSiblings');
const { loadTripContext } = require('../utils/tripContext');

function computeCosts(driverRoute, riderCount, fuelPricePerLiter) {
  const efficiency = Number(process.env.FUEL_EFFICIENCY_KM_PER_LITER) || 5;
  const price = fuelPricePerLiter ?? (Number(process.env.FUEL_PRICE_DEFAULT_PER_LITER) || 285.5);

  const totalDistanceKm = haversineKm(driverRoute.origin, driverRoute.destination);
  const estimatedFuelCost = (totalDistanceKm / efficiency) * price;

  // Total cost is split across the driver + every rider on this run; the driver
  // absorbs their own share by driving, so costPerRider is what each rider owes.
  const occupantCount = riderCount + 1;
  const costPerRider = occupantCount > 0 ? estimatedFuelCost / occupantCount : 0;

  return {
    totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
    estimatedFuelCost: Math.round(estimatedFuelCost * 100) / 100,
    costPerRider: Math.round(costPerRider * 100) / 100,
  };
}

async function buildBreakdown(siblingTrips, costPerRider) {
  return Promise.all(
    siblingTrips.map(async (siblingTrip) => {
      const siblingMatch = await Match.findById(siblingTrip.matchId);
      const riderRoute = siblingMatch ? await Route.findById(siblingMatch.riderRouteId) : null;
      const rider = riderRoute ? await User.findById(riderRoute.userId) : null;

      return {
        userId: rider ? rider._id.toString() : null,
        name: rider ? rider.name : null,
        share: costPerRider,
      };
    })
  );
}

// GET /trips/:tripId/cost-split
async function getCostSplit(req, res) {
  const { trip, driverRoute, riderRoute } = await loadTripContext(req.params.tripId);
  assertParticipant(driverRoute, riderRoute, req.user, 'Not a participant on this trip');

  const siblingTrips = await findSiblingTrips(driverRoute._id);
  const { totalDistanceKm, estimatedFuelCost, costPerRider } = computeCosts(
    driverRoute,
    siblingTrips.length,
    null
  );
  const breakdown = await buildBreakdown(siblingTrips, costPerRider);

  // Read-only: does not persist to Trip.costPerRider. Only /recalculate writes the
  // canonical stored value used elsewhere (e.g. GET /trips) — see doc note.
  return success(res, {
    data: {
      tripId: trip._id.toString(),
      totalDistanceKm,
      estimatedFuelCost,
      riderCount: siblingTrips.length,
      costPerRider,
      breakdown,
    },
  });
}

// POST /trips/:tripId/cost-split/recalculate
async function recalculate(req, res) {
  const { trip, driverRoute } = await loadTripContext(req.params.tripId);
  assertDriverOwner(driverRoute, req.user, 'Not the driver on this trip');

  const siblingTrips = await findSiblingTrips(driverRoute._id);
  const { costPerRider } = computeCosts(driverRoute, siblingTrips.length, req.body.fuelPricePerLiter);

  trip.costPerRider = costPerRider;
  await trip.save();

  return success(res, {
    data: {
      tripId: trip._id.toString(),
      costPerRider: trip.costPerRider,
    },
  });
}

module.exports = { getCostSplit, recalculate };