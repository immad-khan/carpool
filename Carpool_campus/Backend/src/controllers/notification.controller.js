const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const { success, buildPagination } = require('../utils/apiResponse');
const { parsePagination } = require('../utils/pagination');

// GET /notifications
async function listMine(req, res) {
  const { unread } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = { userId: req.user._id };
  if (unread === 'true') filter.read = false;
  else if (unread === 'false') filter.read = true;

  const [notifications, totalItems] = await Promise.all([
    Notification.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  return success(res, {
    data: notifications.map((n) => n.toPublicJSON()),
    pagination: buildPagination({ page, limit, totalItems }),
  });
}

async function findOwned(notificationId, userId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw ApiError.notFound('Notification not found');
  if (notification.userId.toString() !== userId.toString()) {
    throw ApiError.forbidden('Not the owner of this notification');
  }
  return notification;
}

// PATCH /notifications/:notificationId/read
async function markRead(req, res) {
  const notification = await findOwned(req.params.notificationId, req.user._id);
  notification.read = true;
  await notification.save();

  return success(res, { data: { id: notification._id.toString(), read: notification.read } });
}

// PATCH /notifications/read-all
async function markAllRead(req, res) {
  await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
  return success(res, { message: 'All notifications marked as read.' });
}

module.exports = { listMine, markRead, markAllRead };