const { success } = require('../utils/apiResponse');
const { id, ratings } = require('../mock/store');

async function submit(req, res) {
  const { ratedUserId, tripId, score, comment } = req.body;
  const ratingId = id();
  const rating = { id: ratingId, raterId: req.user._id, ratedUserId, tripId, score, comment, createdAt: new Date().toISOString() };
  ratings.set(ratingId, rating);
  return success(res, { statusCode: 201, data: rating });
}

async function forUser(req, res) {
  const userRatings = [...ratings.values()].filter(r => r.ratedUserId === req.params.userId);
  return success(res, { data: userRatings });
}

module.exports = { submit, listForUser: forUser };