const Rating = require('../models/Rating');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { success, buildPagination } = require('../utils/apiResponse');
const { parsePagination } = require('../utils/pagination');
const { assertParticipant } = require('../utils/participants');
const { loadTripContext } = require('../utils/tripContext');

async function recomputeUserRating(userId) {
  const ratings = await Rating.find({ toUserId: userId }).select('score');
  const ratingCount = ratings.length;
  const avg = ratingCount > 0 ? ratings.reduce((sum, r) => sum + r.score, 0) / ratingCount : 0;

  await User.findByIdAndUpdate(userId, {
    rating: Math.round(avg * 100) / 100,
    ratingCount,
  });
}

// POST /ratings
async function submit(req, res) {
  const { tripId, toUserId, score, comment } = req.body;

  const { trip, driverRoute, riderRoute } = await loadTripContext(tripId);
  assertParticipant(driverRoute, riderRoute, req.user, 'Not a participant on this trip');

  const participantIds = [driverRoute?.userId?.toString(), riderRoute?.userId?.toString()];
  if (!participantIds.includes(toUserId) || toUserId === req.user._id.toString()) {
    throw ApiError.badRequest('toUserId must be the other participant on this trip');
  }

  if (trip.status !== 'completed') {
    throw ApiError.badRequest('Trip is not completed');
  }

  const existing = await Rating.findOne({ tripId, fromUserId: req.user._id });
  if (existing) {
    throw ApiError.conflict('Rating already submitted for this trip by this user');
  }

  const rating = await Rating.create({
    tripId,
    fromUserId: req.user._id,
    toUserId,
    score,
    comment: comment || null,
  });

  await recomputeUserRating(toUserId);

  return success(res, { statusCode: 201, data: rating.toPublicJSON() });
}

// GET /users/:userId/ratings
async function listForUser(req, res) {
  const targetUser = await User.findById(req.params.userId);
  if (!targetUser) throw ApiError.notFound('User does not exist');

  const { page, limit, skip } = parsePagination(req.query);

  const filter = { toUserId: req.params.userId };
  const [ratings, totalItems] = await Promise.all([
    Rating.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Rating.countDocuments(filter),
  ]);

  const data = await Promise.all(
    ratings.map(async (r) => {
      const fromUser = await User.findById(r.fromUserId);
      return {
        id: r._id.toString(),
        fromUser: { name: fromUser ? fromUser.name : null },
        score: r.score,
        comment: r.comment,
        createdAt: r.createdAt,
      };
    })
  );

  return success(res, {
    data,
    pagination: buildPagination({ page, limit, totalItems }),
  });
}

module.exports = { submit, listForUser };