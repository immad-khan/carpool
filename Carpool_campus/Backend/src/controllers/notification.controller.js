const { success, noContent } = require('../utils/apiResponse');
const { id, notifications } = require('../mock/store');

async function listMine(req, res) {
  const myNotifs = [...notifications.values()].filter(n => n.userId === req.user._id);
  const unread = req.query.unread === 'true' ? myNotifs.filter(n => !n.read) : myNotifs;
  return success(res, { data: unread });
}

async function markRead(req, res) {
  const notif = notifications.get(req.params.notificationId);
  if (notif) notif.read = true;
  return success(res, { data: { id: req.params.notificationId, read: true } });
}

async function markAllRead(req, res) {
  [...notifications.values()].filter(n => n.userId === req.user._id).forEach(n => n.read = true);
  return noContent(res);
}

module.exports = { listMine, markRead, markAllRead };