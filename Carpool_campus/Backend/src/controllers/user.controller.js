const User = require('../models/User');
const Route = require('../models/Route');
const ApiError = require('../utils/ApiError');
const { success, noContent } = require('../utils/apiResponse');

// GET /users/me
async function getMe(req, res) {
  return success(res, { data: req.user.toPublicJSON() });
}

// GET /users/:userId
async function getById(req, res) {
  const user = await User.findById(req.params.userId);
  if (!user) throw ApiError.notFound('User does not exist');
  return success(res, { data: user.toLimitedPublicJSON() });
}

// PATCH /users/me
async function updateMe(req, res) {
  const { name } = req.body;
  if (name !== undefined) req.user.name = name;
  await req.user.save();

  return success(res, {
    data: { id: req.user._id.toString(), name: req.user.name },
  });
}

// PUT /users/me/profile-picture
async function updateProfilePicture(req, res) {
  if (!req.file) throw ApiError.badRequest('image file is required');

  req.user.profilePictureUrl = req.file.path; // Cloudinary secure URL via multer-storage-cloudinary
  await req.user.save();

  return success(res, { data: { profilePictureUrl: req.user.profilePictureUrl } });
}

// DELETE /users/me
async function deleteMe(req, res) {
  const activeRouteCount = await Route.countDocuments({ userId: req.user._id, status: 'active' });
  if (activeRouteCount > 0) {
    throw ApiError.conflict('Cannot delete while active recurring trips/routes exist');
  }

  req.user.status = 'suspended';
  req.user.email = `deleted_${req.user._id}_${req.user.email}`;
  await req.user.save();

  return noContent(res);
}

module.exports = { getMe, getById, updateMe, updateProfilePicture, deleteMe };
