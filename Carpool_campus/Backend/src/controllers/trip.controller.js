const { success, noContent } = require('../utils/apiResponse');
const { id, trips } = require('../mock/store');
const { buildPagination } = require('../utils/apiResponse');

async function listMine(req, res) {
  const myTrips = [...trips.values()];
  return success(res, {
    data: myTrips,
    pagination: buildPagination({ page: 1, limit: 20, totalItems: myTrips.length }),
  });
}

async function getById(req, res) {
  const trip = trips.get(req.params.tripId);
  if (!trip) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trip not found' } });
  return success(res, { data: trip });
}

async function statusPing(req, res) {
  return success(res, { data: { received: true } });
}

async function complete(req, res) {
  const trip = trips.get(req.params.tripId);
  if (trip) trip.status = 'completed';
  return success(res, { data: trip || {} });
}

async function cancel(req, res) {
  const trip = trips.get(req.params.tripId);
  if (trip) trip.status = 'cancelled';
  return success(res, { data: trip || {} });
}

module.exports = { listMine, getById, statusPing, completeTrip: complete, cancelTrip: cancel };