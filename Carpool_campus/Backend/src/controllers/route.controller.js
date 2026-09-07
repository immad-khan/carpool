const { success, noContent, buildPagination } = require('../utils/apiResponse');
const { id, routes } = require('../mock/store');

async function create(req, res) {
  const { role, origin, destination, daysOfWeek, departureTime } = req.body;
  const routeId = id();
  const route = {
    id: routeId, _id: routeId,
    userId: req.user._id,
    role, origin, destination,
    daysOfWeek: daysOfWeek || [],
    departureTime: departureTime || '08:00',
    status: 'active',
    skippedDates: [],
    createdAt: new Date().toISOString(),
    toPublicJSON() { return { id: this.id, role: this.role, origin: this.origin, destination: this.destination, daysOfWeek: this.daysOfWeek, departureTime: this.departureTime, status: this.status, skippedDates: this.skippedDates }; },
  };
  routes.set(routeId, route);
  return success(res, { statusCode: 201, data: route.toPublicJSON() });
}

async function listMine(req, res) {
  const myRoutes = [...routes.values()].filter(r => r.userId === req.user._id);
  return success(res, {
    data: myRoutes.map(r => ({ id: r.id, role: r.role, daysOfWeek: r.daysOfWeek, departureTime: r.departureTime, status: r.status })),
    pagination: buildPagination({ page: 1, limit: 20, totalItems: myRoutes.length }),
  });
}

async function getById(req, res) {
  const route = routes.get(req.params.routeId);
  if (!route) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
  return success(res, { data: route.toPublicJSON() });
}

async function update(req, res) {
  const route = routes.get(req.params.routeId);
  if (!route) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
  ['origin','destination','daysOfWeek','departureTime'].forEach(f => { if (req.body[f] !== undefined) route[f] = req.body[f]; });
  return success(res, { data: route.toPublicJSON() });
}

async function skipDay(req, res) {
  const route = routes.get(req.params.routeId);
  if (!route) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
  if (!route.skippedDates.includes(req.body.date)) route.skippedDates.push(req.body.date);
  return success(res, { data: { routeId: route.id, skippedDates: route.skippedDates } });
}

async function setStatus(req, res) {
  const route = routes.get(req.params.routeId);
  if (!route) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
  route.status = req.body.status;
  return success(res, { data: { id: route.id, status: route.status } });
}

async function remove(req, res) {
  routes.delete(req.params.routeId);
  return noContent(res);
}

async function getMatchesForRoute(req, res) {
  // Return empty matches list - no real matching without DB
  return success(res, {
    data: [],
    pagination: buildPagination({ page: 1, limit: 20, totalItems: 0 }),
  });
}

module.exports = { create, listMine, getById, update, skipDay, setStatus, remove, getMatchesForRoute };
