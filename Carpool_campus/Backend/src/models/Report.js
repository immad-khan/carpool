const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reportedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ['open', 'reviewing', 'resolved', 'dismissed'], default: 'open' },
    resolutionNotes: { type: String, default: null },
  },
  { timestamps: true }
);

reportSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    reportedUserId: this.reportedUserId.toString(),
    reportedByUserId: this.reportedByUserId.toString(),
    reason: this.reason,
    status: this.status,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Report', reportSchema);