const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['donor', 'receiver', 'admin'], required: true, index: true },
  phone: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date
}, { timestamps: true });

userSchema.methods.comparePassword = function (pwd) {
  return bcrypt.compare(pwd, this.passwordHash);
};

userSchema.statics.hashPassword = (pwd) => bcrypt.hash(pwd, 10);

module.exports = mongoose.model('User', userSchema);
