const { success, noContent } = require('../utils/apiResponse');
const { id, safetyReports } = require('../mock/store');

async function submitReport(req, res) {
  const reportId = id();
  const report = { id: reportId, userId: req.user._id, ...req.body, status: 'open', createdAt: new Date().toISOString() };
  safetyReports.set(reportId, report);
  return success(res, { statusCode: 201, data: report });
}

async function shareStatus(req, res) {
  return success(res, { data: { shareUrl: `https://carpoolcampus.app/track/${req.params.tripId}` } });
}

module.exports = { submitReport, shareStatus };