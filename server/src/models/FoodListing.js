const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  outlet: { type: mongoose.Schema.Types.ObjectId, ref: 'Outlet' },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: String, required: true, index: true },
  totalQuantity: { type: Number, required: true, min: 0 },
  availableQuantity: { type: Number, required: true, min: 0, default: 0 },
  reservedQuantity: { type: Number, default: 0, min: 0 },
  collectedQuantity: { type: Number, default: 0, min: 0 },
  closedQuantity: { type: Number, default: 0, min: 0 },
  unit: { type: String, default: 'packets' },
  servingSize: String,
  prepTime: Date,
  availableFrom: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true, index: true },
  pickupDeadline: { type: Date, required: true, index: true },
  pickupAddress: { type: String, trim: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  city: { type: String, trim: true, index: true },
  storageRequirements: String,
  temperatureRequirements: String,
  packagingCondition: String,
  ingredients: String,
  allergens: String,
  imageUrls: [String],
  allocationMode: { type: String, enum: ['single', 'multiple', 'review', 'auto'], default: 'review' },
  minQtyPerNgo: { type: Number, default: 1 },
  maxNgos: { type: Number, default: 5 },
  partialAllowed: { type: Boolean, default: true },
  maxMatchDistanceKm: { type: Number, default: 25 },
  requestResponseDeadline: Date,
  pickupSlots: [String],
  allowAdditionalRequests: { type: Boolean, default: true },
  preferredNgo: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  specialInstructions: String,
  status: { type: String, enum: ['draft', 'active', 'paused', 'expired', 'closed', 'cancelled'], default: 'active', index: true },
  safetyPaused: { type: Boolean, default: false },
  safetyReason: String,
  // idempotency for creation
  idempotencyKey: { type: String, index: true, sparse: true }
}, { timestamps: true });

listingSchema.index({ location: '2dsphere' });
listingSchema.index({ status: 1, expiryDate: 1, pickupDeadline: 1 });
listingSchema.index({ donor: 1, status: 1 });

module.exports = mongoose.model('FoodListing', listingSchema);
