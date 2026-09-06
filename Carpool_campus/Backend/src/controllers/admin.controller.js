const User = require('../models/User');
const Route = require('../models/Route');
const Match = require('../models/Match');
const Trip = require('../models/Trip');
const Report = require('../models/Report');
const ApiError = require('../utils/ApiError');
const { success, buildPagination } = require('../utils/apiResponse');
const { parsePagination } = require('../utils/pagination');

// GET /admin/users
async function listUsers(req, res) {
  const { verified, role, q } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = {};
  if (verified !== undefined) filter.verified = verified === 'true';
  if (role) filter.roles = role;
  if (q) {
    const regex = new RegExp(q, 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const [users, totalItems] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return success(res, {
    data: users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.roles[0],
      verified: u.verified,
    })),
    pagination: buildPagination({ page, limit, totalItems }),
  });
}

// PATCH /admin/users/:userId/verify
async function verifyUser(req, res) {
  const user = await User.findById(req.params.userId);
  if (!user) throw ApiError.notFound('User does not exist');

  user.verified = true;
  await user.save();

  return success(res, { data: { id: user._id.toString(), verified: user.verified } });
}

// PATCH /admin/users/:userId/status
async function setUserStatus(req, res) {
  const user = await User.findById(req.params.userId);
  if (!user) throw ApiError.notFound('User does not exist');

  // Note: User schema (Module 3) has no field to persist a suspension reason —
  // req.body.reason is accepted per API.md but not stored. Also note: this reuses
  // the same status: 'suspended' value that user.controller.js's self-delete
  // (deleteMe) already uses, so an admin-suspended account and a self-deleted one
  // aren't distinguishable by status alone. Both flagged for Microponder, not fixed
  // here — see Module 14 doc note.
  user.status = req.body.status;
  await user.save();

  return success(res, { data: { id: user._id.toString(), status: user.status } });
}

// GET /admin/reports
async function listReports(req, res) {
  const { status } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = {};
  if (status) filter.status = status;

  const [reports, totalItems] = await Promise.all([
    Report.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Report.countDocuments(filter),
  ]);

  return success(res, {
    data: reports.map((r) => r.toPublicJSON()),
    pagination: buildPagination({ page, limit, totalItems }),
  });
}

// PATCH /admin/reports/:reportId/resolve
async function resolveReport(req, res) {
  const report = await Report.findById(req.params.reportId);
  if (!report) throw ApiError.notFound('Report not found');

  const { resolution, notes } = req.body;
  report.status = resolution;
  report.resolutionNotes = notes || null;
  await report.save();

  return success(res, { data: { id: report._id.toString(), status: report.status } });
}

// GET /admin/analytics/overview
async function analyticsOverview(req, res) {
  const [routesPosted, activeUsers, matchAgg, confirmedRecurringTrips] = await Promise.all([
    Route.countDocuments({}),
    User.countDocuments({ status: 'active' }),
    Match.aggregate([
      {
        $group: {
          _id: null,
          driverRouteIds: { $addToSet: '$driverRouteId' },
          riderRouteIds: { $addToSet: '$riderRouteId' },
        },
      },
    ]),
    Trip.countDocuments({ status: { $ne: 'cancelled' } }),
  ]);

  let routesWithAtLeastOneMatchPct = 0;
  if (routesPosted > 0 && matchAgg.length > 0) {
    const uniqueRouteIds = new Set([
      ...matchAgg[0].driverRouteIds.map((id) => id.toString()),
      ...matchAgg[0].riderRouteIds.map((id) => id.toString()),
    ]);
    routesWithAtLeastOneMatchPct = Math.round((uniqueRouteIds.size / routesPosted) * 1000) / 10;
  }

  return success(res, {
    data: {
      routesPosted,
      activeUsers,
      routesWithAtLeastOneMatchPct,
      confirmedRecurringTrips,
    },
  });
}

module.exports = { listUsers, verifyUser, setUserStatus, listReports, resolveReport, analyticsOverview };