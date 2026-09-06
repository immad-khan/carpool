const mongoose = require('mongoose');

// NOTE: No GET-by-token endpoint is documented in API.md §15, so this token is
// generated and persisted but currently has no way to be resolved/consumed by
// anyone who follows the link. Groundwork only — see Module 15 doc note.
const shareTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    emergencyContactId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyContact', required: true },
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShareToken', shareTokenSchema);