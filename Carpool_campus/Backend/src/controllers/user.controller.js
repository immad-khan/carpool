const { success, noContent } = require('../utils/apiResponse');
const { MOCK_USER } = require('../mock/store');

async function getMe(req, res) {
  return success(res, { data: req.user.toPublicJSON() });
}

async function getById(req, res) {
  return success(res, { data: MOCK_USER.toLimitedPublicJSON() });
}

async function updateMe(req, res) {
  const { name } = req.body;
  if (name) req.user.name = name;
  return success(res, { data: { id: req.user._id, name: req.user.name } });
}

async function updateProfilePicture(req, res) {
  return success(res, { data: { profilePictureUrl: 'https://placehold.co/100x100' } });
}

async function deleteMe(req, res) {
  return noContent(res);
}

module.exports = { getMe, getById, updateMe, updateProfilePicture, deleteMe };
