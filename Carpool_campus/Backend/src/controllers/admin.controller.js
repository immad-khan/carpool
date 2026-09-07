const { success } = require('../utils/apiResponse');
const { buildPagination } = require('../utils/apiResponse');
const { safetyReports } = require('../mock/store');

async function listUsers(req, res) {
  return success(res, {
    data: [
      { id: 'mock-user-001', name: 'Test User', email: 'test@gcu.edu.pk', roles: ['rider'], status: 'active', verified: true },
    ],
    pagination: buildPagination({ page: 1, limit: 20, totalItems: 1 }),
  });
}

async function verifyUser(req, res) {
  return success(res, { data: { id: req.params.userId, verified: true } });
}

async function setUserStatus(req, res) {
  return success(res, { data: { id: req.params.userId, status: req.body.status } });
}

async function listReports(req, res) {
  const reports = [...safetyReports.values()];
  return success(res, {
    data: reports,
    pagination: buildPagination({ page: 1, limit: 20, totalItems: reports.length }),
  });
}

async function resolveReport(req, res) {
  return success(res, { data: { id: req.params.reportId, resolution: req.body.resolution, status: 'resolved' } });
}

async function analytics(req, res) {
  return success(res, {
    data: {
      totalUsers: 1,
      totalRoutes: 0,
      totalTrips: 0,
      activeMatches: 0,
      reportsOpen: safetyReports.size,
    },
  });
}

module.exports = { listUsers, verifyUser, setUserStatus, listReports, resolveReport, analyticsOverview: analytics };