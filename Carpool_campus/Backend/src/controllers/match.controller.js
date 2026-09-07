const { success } = require('../utils/apiResponse');
const { buildPagination } = require('../utils/apiResponse');
const { id, matches } = require('../mock/store');

async function getMatch(req, res) {
  const match = matches.get(req.params.matchId);
  if (!match) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Match not found' } });
  return success(res, { data: match });
}

module.exports = { getMatch };
