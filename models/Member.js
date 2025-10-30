const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const memberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    YOB: { type: Number },
    gender: { type: Boolean }, // true = male, false = female
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

memberSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

memberSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Members', memberSchema);
