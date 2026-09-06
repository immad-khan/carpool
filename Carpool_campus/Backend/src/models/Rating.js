const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

// One rating per (trip, rater) pair — enforces the documented 409 duplicate-rating rule.
ratingSchema.index({ tripId: 1, fromUserId: 1 }, { unique: true });

ratingSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    tripId: this.tripId.toString(),
    fromUserId: this.fromUserId.toString(),
    toUserId: this.toUserId.toString(),
    score: this.score,
    comment: this.comment,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Rating', ratingSchema);