const Notification = require('../models/Notification');

async function notify(userId, type, message, meta = {}) {
  if (!userId) return null;
  return Notification.create({ userId, type, message, meta });
}

module.exports = { notify };