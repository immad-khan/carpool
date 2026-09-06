const Match = require('../models/Match');
const Route = require('../models/Route');
const User = require('../models/User');
const Trip = require('../models/Trip');
const ApiError = require('../utils/ApiError');
const { success, buildPagination } = require('../utils/apiResponse');
const { parsePagination } = require('../utils/pagination');
const { computeNextOccurrenceDate } = require('../utils/scheduling');

const { assertRiderOwner, assertDriverOwner } = require('../utils/participants');
const { notify } = require('../utils/notify');

async function loadMatchWithRoutes(matchId) {
  const match = await Match.findById(matchId);
  if (!match) throw ApiError.notFound('Match not found');

  const [driverRoute, riderRoute] = await Promise.all([
    Route.findById(match.driverRouteId),
    Route.findById(match.riderRouteId),
  ]);

  return { match, driverRoute, riderRoute };
}

// POST /matches/:matchId/request
async function sendRequest(req, res) {
  const { match, driverRoute, riderRoute } = await loadMatchWithRoutes(req.params.matchId);
  assertRiderOwner(riderRoute, req.user, 'Not the rider on this match');

  if (match.status !== 'suggested') {
    if (match.status === 'requested') {
      throw ApiError.conflict('A request already exists for this match');
    }
    throw ApiError.badRequest('Match not in suggested state');
  }

  match.status = 'requested';
  match.requestMessage = req.body.message || null;
  match.requestedAt = new Date();
  await match.save();

  await notify(
    driverRoute.userId,
    'ride_request_received',
    `${req.user.name} requested a seat on your route.`,
    { matchId: match._id.toString() }
  );

  return success(res, {
    statusCode: 201,
    data: {
      matchId: match._id.toString(),
      status: match.status,
      requestedAt: match.requestedAt,
    },
  });
}

// GET /requests
async function listIncoming(req, res) {
  const { status } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const driverRoutes = await Route.find({ userId: req.user._id, role: 'driver' }).select('_id');
  const driverRouteIds = driverRoutes.map((r) => r._id);

  const filter = { driverRouteId: { $in: driverRouteIds } };
  filter.status = status || { $in: ['requested', 'approved', 'declined'] };

  const [matches, totalItems] = await Promise.all([
    Match.find(filter).sort('-requestedAt').skip(skip).limit(limit),
    Match.countDocuments(filter),
  ]);

  const data = await Promise.all(
    matches.map(async (match) => {
      const riderRoute = await Route.findById(match.riderRouteId);
      const rider = riderRoute ? await User.findById(riderRoute.userId) : null;

      return {
        matchId: match._id.toString(),
        rider: rider
          ? { userId: rider._id.toString(), name: rider.name, rating: rider.rating }
          : null,
        overlapScore: match.overlapScore,
        status: match.status,
        requestedAt: match.requestedAt,
      };
    })
  );

  return success(res, {
    data,
    pagination: buildPagination({ page, limit, totalItems }),
  });
}

// PATCH /matches/:matchId/approve
async function approve(req, res) {
  const { match, driverRoute, riderRoute } = await loadMatchWithRoutes(req.params.matchId);
  assertDriverOwner(driverRoute, req.user, 'Not the driver on this match');

  if (match.status !== 'requested') {
    throw ApiError.badRequest('Match not in requested state');
  }

  match.status = 'approved';
  await match.save();

  const date = computeNextOccurrenceDate(driverRoute.daysOfWeek, driverRoute.skippedDates);
  const trip = await Trip.create({ matchId: match._id, date, status: 'upcoming', costPerRider: null });

  // costPerRider stays null here by design (Module 11): it's only populated once
  // POST /trips/:tripId/cost-split/recalculate is called for this trip.
  await notify(
    riderRoute.userId,
    'ride_request_approved',
    'Your ride request was approved.',
    { matchId: match._id.toString(), tripId: trip._id.toString() }
  );

  return success(res, {
    data: {
      matchId: match._id.toString(),
      status: match.status,
      tripId: trip._id.toString(),
    },
  });
}

// PATCH /matches/:matchId/decline
async function decline(req, res) {
  const { match, driverRoute, riderRoute } = await loadMatchWithRoutes(req.params.matchId);
  assertDriverOwner(driverRoute, req.user, 'Not the driver on this match');

  if (match.status !== 'requested') {
    throw ApiError.badRequest('Match not in requested state');
  }

  match.status = 'declined';
  await match.save();

  // Note: Match schema (module 8) has no field to persist a decline reason.
  // req.body.reason is accepted per API.md but not stored — flagging as a
  // possible schema gap for Microponder rather than adding a field myself.
  await notify(
    riderRoute.userId,
    'ride_request_declined',
    'Your ride request was declined.',
    { matchId: match._id.toString() }
  );

  return success(res, {
    data: {
      matchId: match._id.toString(),
      status: match.status,
    },
  });
}

module.exports = { sendRequest, listIncoming, approve, decline };