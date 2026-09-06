const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

emergencyContactSchema.methods.toPublicJSON = function toPublicJSON() {
  return { id: this._id.toString(), name: this.name, phone: this.phone };
};

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
