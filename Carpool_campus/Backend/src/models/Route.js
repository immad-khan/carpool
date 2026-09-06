const mongoose = require('mongoose');

const geoPointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    label: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const routeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['driver', 'rider'], required: true },
    origin: { type: geoPointSchema, required: true },
    destination: { type: geoPointSchema, required: true },
    daysOfWeek: {
      type: [String],
      enum: DAYS,
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    departureTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    status: { type: String, enum: ['active', 'paused', 'archived'], default: 'active' },
    skippedDates: { type: [String], default: [] }, // ISO dates YYYY-MM-DD
  },
  { timestamps: true }
);

routeSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    role: this.role,
    origin: this.origin,
    destination: this.destination,
    daysOfWeek: this.daysOfWeek,
    departureTime: this.departureTime,
    status: this.status,
    createdAt: this.createdAt,
  };
};

routeSchema.statics.DAYS = DAYS;

module.exports = mongoose.model('Route', routeSchema);
