const { success } = require('../utils/apiResponse');

async function upsertMyProfile(req, res) {
  const { carModel, plateNumber, seatsAvailable } = req.body;
  return success(res, {
    data: {
      id: 'mock-driver-profile-001',
      userId: req.user._id,
      carModel: carModel || 'Toyota Corolla',
      plateNumber: plateNumber || 'ABC-123',
      seatsAvailable: seatsAvailable || 3,
    },
  });
}

async function getByUserId(req, res) {
  // Return not found for non-self to prevent crash on dashboard load
  return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'No driver profile for this user' } });
}

module.exports = { upsertMyProfile, getByUserId };
