const mongoose = require('mongoose');

const orgSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orgName: { type: String, required: true, trim: true },
  orgType: { type: String, required: true }, // donor category or receiver category
  accountType: { type: String, enum: ['donor', 'receiver'], required: true, index: true },
  registrationDetails: { type: String, trim: true },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected', 'suspended'], default: 'pending', index: true },
  suspensionReason: String,
  contactPerson: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true, index: true },
  pincode: { type: String, trim: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },
  serviceRadiusKm: { type: Number, default: 10 },
  capacity: {
    storageKg: { type: Number, default: 0 },
    dailyReceiveKg: { type: Number, default: 0 }
  },
  foodPreferences: [String],
  operatingHours: { type: String, trim: true },
  documents: [String],
  staffAvailability: String,
  vehicleAvailable: { type: Boolean, default: false },
  preferredPickupArrangements: String,
  foodCategoriesDonated: [String],
  // fairness tracking
  totalReceivedKg: { type: Number, default: 0 },
  completedPickups: { type: Number, default: 0 },
  missedPickups: { type: Number, default: 0 },
  cancellations: { type: Number, default: 0 },
  lastAllocationAt: Date,
  // donor allocation prefs (for donor orgs)
  allocationDefaults: {
    mode: { type: String, enum: ['single', 'multiple', 'review', 'auto'], default: 'review' },
    minQtyPerNgo: { type: Number, default: 1 },
    maxNgos: { type: Number, default: 5 },
    partialAllowed: { type: Boolean, default: true },
    maxMatchDistanceKm: { type: Number, default: 25 },
    allowAdditionalRequests: { type: Boolean, default: true }
  }
}, { timestamps: true });

orgSchema.index({ location: '2dsphere' });
orgSchema.index({ accountType: 1, verificationStatus: 1, city: 1 });

module.exports = mongoose.model('Organization', orgSchema);
