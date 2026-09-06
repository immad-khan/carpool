const crypto = require('crypto');
const Report = require('../models/Report');
const User = require('../models/User');
const Trip = require('../models/Trip');
const EmergencyContact = require('../models/EmergencyContact');
const ShareToken = require('../models/ShareToken');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const { assertParticipant } = require('../utils/participants');
const { loadTripContext } = require('../utils/tripContext');

// POST /safety/reports
async function submitReport(req, res) {
  const { reportedUserId, tripId, reason } = req.body;

  const reportedUser = await User.findById(reportedUserId);
  if (!reportedUser) throw ApiError.notFound('Reported user not found');

  if (tripId) {
    const trip = await Trip.findById(tripId);
    if (!trip) throw ApiError.notFound('Trip not found');
  }

  const report = await Report.create({
    reportedUserId,
    reportedByUserId: req.user._id,
    tripId: tripId || null,
    reason,
    status: 'open',
  });

  return success(res, {
    statusCode: 201,
    data: { id: report._id.toString(), status: report.status },
  });
}

// POST /trips/:tripId/share-status
async function shareStatus(req, res) {
  const { trip, driverRoute, riderRoute } = await loadTripContext(req.params.tripId);
  assertParticipant(driverRoute, riderRoute, req.user, 'Not a participant on this trip');

  const contact = await EmergencyContact.findById(req.body.emergencyContactId);
  if (!contact) throw ApiError.notFound('Emergency contact not found');
  if (contact.userId.toString() !== req.user._id.toString()) {
    throw ApiError.badRequest('Invalid emergency contact');
  }

  const token = crypto.randomBytes(24).toString('hex');
  // TTL and delivery channel are TBD per API.md §16 — same "TBD tunable" pattern as
  // the existing MATCH_* and FUEL_* env vars.
  const ttlSeconds = Number(process.env.SHARE_STATUS_TTL_SECONDS) || 14400; // default 4 hours
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  await ShareToken.create({
    token,
    tripId: trip._id,
    emergencyContactId: contact._id,
    createdByUserId: req.user._id,
    expiresAt,
  });

  const baseUrl = process.env.SHARE_STATUS_BASE_URL || 'https://carpoolcampus.app/track';
  const shareUrl = `${baseUrl}/${token}`;

  // NOTE: no SMS/email delivery to the contact happens here — API.md marks the
  // delivery channel as TBD. The link is generated and persisted, not sent.
  return success(res, { data: { shareUrl, expiresAt } });
}

module.exports = { submitReport, shareStatus };