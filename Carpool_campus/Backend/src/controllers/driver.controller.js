const DriverProfile = require('../models/DriverProfile');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');

// PUT /drivers/me  (upsert)
async function upsertMyProfile(req, res) {
  const { carModel, plateNumber, seatsAvailable } = req.body;

  const profile = await DriverProfile.findOneAndUpdate(
    { userId: req.user._id },
    { carModel, plateNumber, seatsAvailable },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

  // Ensure the user has driver capability once they set up a profile.
  if (!req.user.hasCapability('driver')) {
    req.user.roles.push('driver');
    await req.user.save();
  }

  return success(res, { data: profile.toPublicJSON() });
}

// GET /drivers/:userId
async function getByUserId(req, res) {
  const profile = await DriverProfile.findOne({ userId: req.params.userId });
  if (!profile) throw ApiError.notFound('No driver profile for this user');
  return success(res, { data: profile.toPublicJSON() });
}

module.exports = { upsertMyProfile, getByUserId };
