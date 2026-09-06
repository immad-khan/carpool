const ApiError = require('./ApiError');

function isSameUser(route, user) {
  return Boolean(route) && route.userId.toString() === user._id.toString();
}

function assertDriverOwner(driverRoute, user, message = 'Not the driver on this resource') {
  if (!isSameUser(driverRoute, user)) throw ApiError.forbidden(message);
}

function assertDriverOwnerOrAdmin(driverRoute, user, message = 'Not the driver on this resource') {
  if (isSameUser(driverRoute, user) || user.isAdmin()) return;
  throw ApiError.forbidden(message);
}

function assertRiderOwner(riderRoute, user, message = 'Not the rider on this resource') {
  if (!isSameUser(riderRoute, user)) throw ApiError.forbidden(message);
}

function assertParticipant(driverRoute, riderRoute, user, message = 'Not a participant on this resource') {
  if (!isSameUser(driverRoute, user) && !isSameUser(riderRoute, user)) {
    throw ApiError.forbidden(message);
  }
}

function assertParticipantOrAdmin(driverRoute, riderRoute, user, message = 'Not a participant on this resource') {
  if (isSameUser(driverRoute, user) || isSameUser(riderRoute, user) || user.isAdmin()) return;
  throw ApiError.forbidden(message);
}

module.exports = {
  isSameUser,
  assertDriverOwner,
  assertDriverOwnerOrAdmin,
  assertRiderOwner,
  assertParticipant,
  assertParticipantOrAdmin,
};