const mongoose = require('mongoose');

const driverProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    carModel: { type: String, required: true, trim: true },
    plateNumber: { type: String, required: true, trim: true },
    seatsAvailable: { type: Number, required: true, min: 1, max: 8 },
  },
  { timestamps: true }
);

driverProfileSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    userId: this.userId.toString(),
    carModel: this.carModel,
    plateNumber: this.plateNumber,
    seatsAvailable: this.seatsAvailable,
  };
};

module.exports = mongoose.model('DriverProfile', driverProfileSchema);
