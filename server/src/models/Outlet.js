const mongoose = require('mongoose');

const outletSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  branchName: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  contactPerson: String,
  phone: String,
  operatingHours: String
}, { timestamps: true });

outletSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Outlet', outletSchema);
