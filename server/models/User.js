const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const platformSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    joinedDate: { type: Date, default: Date.now }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    city: { type: String, trim: true },
    vehicleType: { type: String, enum: ['bike', 'car', 'bicycle', 'none'], default: 'none' },
    platforms: [platformSchema],
    workingSince: { type: Date },
    passwordHash: { type: String, required: true },
    onboardingDone: { type: Boolean, default: false }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.findByPhone = function findByPhone(phone) {
  return this.findOne({ phone });
};

module.exports = mongoose.model('User', userSchema);
