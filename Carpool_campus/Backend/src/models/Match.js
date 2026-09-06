const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    driverRouteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true, index: true },
    riderRouteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true, index: true },
    overlapScore: { type: Number, required: true, min: 0, max: 1 },
    status: {
      type: String,
      enum: ['suggested', 'requested', 'approved', 'declined'],
      default: 'suggested',
    },
    requestMessage: { type: String, default: null },
    requestedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

matchSchema.index({ driverRouteId: 1, riderRouteId: 1 }, { unique: true });

matchSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    driverRouteId: this.driverRouteId.toString(),
    riderRouteId: this.riderRouteId.toString(),
    overlapScore: this.overlapScore,
    status: this.status,
  };
};

module.exports = mongoose.model('Match', matchSchema);
