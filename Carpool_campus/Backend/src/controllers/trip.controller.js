const Trip = require('../models/Trip');
const Match = require('../models/Match');
const Route = require('../models/Route');
const ApiError = require('../utils/ApiError');
const { success, buildPagination } = require('../utils/apiResponse');
const { parsePagination } = require('../utils/pagination');
const { isScheduledToday } = require('../utils/scheduling');
const { notify } = require('../utils/notify');
const { findSiblingTrips } = require('../utils/tripSiblings');
const { loadTripContext } = require('../utils/tripContext');
const {
  assertDriverOwner,
  assertDriverOwnerOrAdmin,
  assertParticipant,
  assertParticipantOrAdmin,
} = require('../utils/participants');

function conflictMessageFor(status) {
  return status === 'completed' ? 'Trip already completed' : 'Trip already cancelled';
}

// GET /trips
async function listMine(req, res) {
  const { status, from, to } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const myRoutes = await Route.find({ userId: req.user._id }).select('_id');
  const myRouteIds = myRoutes.map((r) => r._id);

  const myMatches = await Match.find({
    $or: [{ driverRouteId: { $in: myRouteIds } }, { riderRouteId: { $in: myRouteIds } }],
  }).select('_id');
  const myMatchIds = myMatches.map((m) => m._id);

  const filter = { matchId: { $in: myMatchIds } };
  if (status) filter.status = status;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }

  const [trips, totalItems] = await Promise.all([
    Trip.find(filter).sort('-date').skip(skip).limit(limit),
    Trip.countDocuments(filter),
  ]);

  return success(res, {
    data: trips.map((t) => t.toPublicJSON()),
    pagination: buildPagination({ page, limit, totalItems }),
  });
}

// GET /trips/:tripId
async function getById(req, res) {
  const { trip, driverRoute, riderRoute } = await loadTripContext(req.params.tripId);
  assertParticipantOrAdmin(driverRoute, riderRoute, req.user, 'Not a participant on this trip');
  return success(res, { data: trip.toPublicJSON() });
}

// POST /trips/:tripId/status-ping
async function statusPing(req, res) {
  const { driverRoute } = await loadTripContext(req.params.tripId);
  assertDriverOwner(driverRoute, req.user, 'Not the driver on this trip');

  if (!isScheduledToday(driverRoute.daysOfWeek, driverRoute.skippedDates)) {
    throw ApiError.notFound('Trip not found or not scheduled for today');
  }

  const { status, etaMinutes } = req.body;
  const message =
    etaMinutes !== undefined
      ? `Your driver is ${status.replace(/_/g, ' ')} — ETA ${etaMinutes} min.`
      : `Your driver status: ${status.replace(/_/g, ' ')}.`;

  const siblingTrips = await findSiblingTrips(driverRoute._id);
  await Promise.all(
    siblingTrips.map(async (siblingTrip) => {
      const siblingMatch = await Match.findById(siblingTrip.matchId);
      if (!siblingMatch) return;
      const riderRoute = await Route.findById(siblingMatch.riderRouteId);
      if (!riderRoute) return;
      await notify(riderRoute.userId, 'trip_status_ping', message, {
        tripId: siblingTrip._id.toString(),
        status,
        etaMinutes: etaMinutes ?? null,
      });
    })
  );

  // TODO(Socket.IO infra): notifications are now persisted (Module 13), but real-time
  // delivery still isn't — no WebSocket server exists yet in the codebase.

  return success(res, { message: 'Status ping sent to riders.' });
}

// PATCH /trips/:tripId/complete
async function completeTrip(req, res) {
  const { trip, driverRoute } = await loadTripContext(req.params.tripId);
  assertDriverOwnerOrAdmin(driverRoute, req.user, 'Not the driver on this trip');

  if (trip.status !== 'upcoming') {
    throw ApiError.conflict(conflictMessageFor(trip.status));
  }

  trip.status = 'completed';
  await trip.save();

  return success(res, { data: { id: trip._id.toString(), status: trip.status } });
}

// PATCH /trips/:tripId/cancel
async function cancelTrip(req, res) {
  const { trip, driverRoute, riderRoute } = await loadTripContext(req.params.tripId);

  // Per API.md, cancel authorization is Driver or Rider participant only (no Admin
  // bypass, unlike complete). Followed literally — see documentation note.
  assertParticipant(driverRoute, riderRoute, req.user, 'Not a participant on this trip');

  if (trip.status !== 'upcoming') {
    throw ApiError.conflict(conflictMessageFor(trip.status));
  }

  trip.status = 'cancelled';
  trip.cancelReason = req.body.reason || null;
  await trip.save();

  return success(res, { data: { id: trip._id.toString(), status: trip.status } });
}

module.exports = { listMine, getById, statusPing, completeTrip, cancelTrip };