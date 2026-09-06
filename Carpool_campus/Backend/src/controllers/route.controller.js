const Route = require('../models/Route');
const DriverProfile = require('../models/DriverProfile');
const Match = require('../models/Match');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { success, noContent, buildPagination } = require('../utils/apiResponse');
const { parsePagination } = require('../utils/pagination');
const { computeOverlapScore } = require('../utils/matching');

// POST /routes
async function create(req, res) {
  const { role, origin, destination, daysOfWeek, departureTime } = req.body;

  if (role === 'driver') {
    const hasProfile = await DriverProfile.exists({ userId: req.user._id });
    if (!hasProfile) {
      throw ApiError.forbidden('Posting a driver route requires a completed DriverProfile');
    }
    if (!req.user.hasCapability('driver')) {
      req.user.roles.push('driver');
      await req.user.save();
    }
  } else if (!req.user.hasCapability('rider')) {
    req.user.roles.push('rider');
    await req.user.save();
  }

  const route = await Route.create({
    userId: req.user._id,
    role,
    origin,
    destination,
    daysOfWeek,
    departureTime,
  });

  return success(res, { statusCode: 201, data: route.toPublicJSON() });
}

// GET /routes/me
async function listMine(req, res) {
  const { role, status } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = { userId: req.user._id };
  if (role) filter.role = role;
  if (status) filter.status = status;

  const [routes, totalItems] = await Promise.all([
    Route.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Route.countDocuments(filter),
  ]);

  return success(res, {
    data: routes.map((r) => ({
      id: r._id.toString(),
      role: r.role,
      daysOfWeek: r.daysOfWeek,
      departureTime: r.departureTime,
      status: r.status,
    })),
    pagination: buildPagination({ page, limit, totalItems }),
  });
}

async function findRouteOr404(routeId) {
  const route = await Route.findById(routeId);
  if (!route) throw ApiError.notFound('Route not found');
  return route;
}

function assertOwnerOrAdmin(route, user) {
  if (route.userId.toString() !== user._id.toString() && !user.isAdmin()) {
    throw ApiError.forbidden('Not permitted to access this route');
  }
}

// GET /routes/:routeId
async function getById(req, res) {
  const route = await findRouteOr404(req.params.routeId);
  assertOwnerOrAdmin(route, req.user);
  return success(res, { data: route.toPublicJSON() });
}

// PATCH /routes/:routeId
async function update(req, res) {
  const route = await findRouteOr404(req.params.routeId);
  assertOwnerOrAdmin(route, req.user);

  const editable = ['origin', 'destination', 'daysOfWeek', 'departureTime'];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) route[field] = req.body[field];
  });
  await route.save();

  return success(res, { data: route.toPublicJSON() });
}

// POST /routes/:routeId/skip
async function skipDay(req, res) {
  const route = await findRouteOr404(req.params.routeId);
  assertOwnerOrAdmin(route, req.user);

  const { date } = req.body;
  if (!route.skippedDates.includes(date)) {
    route.skippedDates.push(date);
    await route.save();
  }

  return success(res, {
    data: { routeId: route._id.toString(), skippedDates: route.skippedDates },
  });
}

// PATCH /routes/:routeId/status
async function setStatus(req, res) {
  const route = await findRouteOr404(req.params.routeId);
  assertOwnerOrAdmin(route, req.user);

  route.status = req.body.status;
  await route.save();

  return success(res, { data: { id: route._id.toString(), status: route.status } });
}

// DELETE /routes/:routeId
async function remove(req, res) {
  const route = await findRouteOr404(req.params.routeId);
  assertOwnerOrAdmin(route, req.user);

  const activeMatches = await Match.countDocuments({
    $or: [{ driverRouteId: route._id }, { riderRouteId: route._id }],
    status: { $in: ['requested', 'approved'] },
  });
  if (activeMatches > 0) {
    throw ApiError.conflict('Active matches/trips depend on this route; archive it instead');
  }

  await route.deleteOne();
  return noContent(res);
}

// GET /routes/:routeId/matches
async function getMatchesForRoute(req, res) {
  const route = await findRouteOr404(req.params.routeId);
  if (route.userId.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not the route owner');
  }

  const minOverlap = req.query.minOverlap !== undefined
    ? Number(req.query.minOverlap)
    : Number(process.env.MATCH_MIN_OVERLAP_DEFAULT) || 0.3;

  const oppositeRole = route.role === 'driver' ? 'rider' : 'driver';
  const candidates = await Route.find({ role: oppositeRole, status: 'active' });

  const scored = [];
  for (const candidate of candidates) {
    const { overlapScore } = computeOverlapScore(route, candidate);
    if (overlapScore < minOverlap) continue;

    const driverRouteId = route.role === 'driver' ? route._id : candidate._id;
    const riderRouteId = route.role === 'driver' ? candidate._id : route._id;

    const match = await Match.findOneAndUpdate(
      { driverRouteId, riderRouteId },
      { $setOnInsert: { overlapScore, status: 'suggested' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const counterpartUser = await User.findById(candidate.userId);

    scored.push({
      matchId: match._id.toString(),
      counterpartRoute: {
        routeId: candidate._id.toString(),
        userId: candidate.userId.toString(),
        name: counterpartUser?.name,
        role: candidate.role,
        rating: counterpartUser?.rating ?? 0,
        departureTime: candidate.departureTime,
        daysOfWeek: candidate.daysOfWeek,
      },
      overlapScore: match.overlapScore,
      status: match.status,
    });
  }

  scored.sort((a, b) => b.overlapScore - a.overlapScore);

  const { page, limit, skip } = parsePagination(req.query);
  const totalItems = scored.length;
  const pageItems = scored.slice(skip, skip + limit);

  return success(res, {
    data: pageItems,
    pagination: buildPagination({ page, limit, totalItems }),
  });
}

module.exports = {
  create,
  listMine,
  getById,
  update,
  skipDay,
  setStatus,
  remove,
  getMatchesForRoute,
};
