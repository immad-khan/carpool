const { success, noContent } = require('../utils/apiResponse');
const { id, matches, trips } = require('../mock/store');
const { buildPagination } = require('../utils/apiResponse');

async function sendRequest(req, res) {
  const matchId = req.params.matchId;
  const match = matches.get(matchId);
  if (!match) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Match not found' } });
  match.status = 'requested';
  return success(res, { data: match });
}

async function listIncoming(req, res) {
  return success(res, {
    data: [],
    pagination: buildPagination({ page: 1, limit: 20, totalItems: 0 }),
  });
}

async function approve(req, res) {
  const match = matches.get(req.params.matchId);
  if (!match) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Match not found' } });
  match.status = 'approved';
  // Create a trip
  const tripId = id();
  trips.set(tripId, { id: tripId, matchId: req.params.matchId, status: 'upcoming', createdAt: new Date().toISOString() });
  return success(res, { data: match });
}

async function decline(req, res) {
  const match = matches.get(req.params.matchId);
  if (match) match.status = 'declined';
  return success(res, { data: match || {} });
}

module.exports = { sendRequest, listIncoming, approve, decline };