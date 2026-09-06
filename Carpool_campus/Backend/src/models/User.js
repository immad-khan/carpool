const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    // Capabilities the account holds. A user can gain the opposite capability
    // later (e.g. a rider who also posts a driver route) per API.md §1.3.
    roles: {
      type: [String],
      enum: ['rider', 'driver', 'admin'],
      default: [],
      required: true,
    },
    verified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    profilePictureUrl: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Primary role for API responses that expect a single `role` field
// (the role the account registered with, i.e. roles[0]).
userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.roles[0],
    verified: this.verified,
    rating: this.rating,
    profilePictureUrl: this.profilePictureUrl,
    createdAt: this.createdAt,
  };
};

userSchema.methods.toLimitedPublicJSON = function toLimitedPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    role: this.roles[0],
    rating: this.rating,
    profilePictureUrl: this.profilePictureUrl,
  };
};

userSchema.methods.isAdmin = function isAdmin() {
  return this.roles.includes('admin');
};

userSchema.methods.hasCapability = function hasCapability(role) {
  return this.roles.includes(role);
};

module.exports = mongoose.model('User', userSchema);
