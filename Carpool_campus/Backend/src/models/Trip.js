const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true, unique: true, index: true },
    // ISO date (YYYY-MM-DD) of the first/next scheduled occurrence.
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
    costPerRider: { type: Number, default: null }, // set by Module 11 (Cost-Split)
    cancelReason: { type: String, default: null },
  },
  { timestamps: true }
);

tripSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    matchId: this.matchId.toString(),
    date: this.date,
    status: this.status,
    costPerRider: this.costPerRider,
  };
};

module.exports = mongoose.model('Trip', tripSchema);