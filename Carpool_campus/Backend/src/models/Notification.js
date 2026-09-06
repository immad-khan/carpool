const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    type: this.type,
    message: this.message,
    read: this.read,
    createdAt: this.createdAt,
    meta: this.meta,
  };
};

module.exports = mongoose.model('Notification', notificationSchema);