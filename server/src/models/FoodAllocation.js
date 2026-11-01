const mongoose = require('mongoose');

const allocSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true, index: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'PickupRequest' },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  requestedQuantity: { type: Number, required: true },
  allocatedQuantity: { type: Number, required: true, min: 0 },
  collectedQuantity: { type: Number, default: 0, min: 0 },
  priorityScore: { type: Number, default: 0 },
  status: { type: String, enum: ['reserved', 'ready_for_pickup', 'partially_collected', 'completed', 'cancelled', 'expired', 'released', 'disputed'], default: 'reserved', index: true },
  reservedAt: { type: Date, default: Date.now },
  reservationExpiresAt: { type: Date, index: true },
  pickupTokenHash: { type: String },
  otpExpiresAt: Date,
  authorizedCollector: { type: String, trim: true },
  verifiedAt: Date,
  pickupEvidence: String,
  discrepancyNote: String,
  cancellationReason: String,
  releasedQuantity: { type: Number, default: 0 },
  isAdditional: { type: Boolean, default: false },
  parentAllocation: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodAllocation' }
}, { timestamps: true });

allocSchema.index({ listing: 1, ngo: 1, status: 1 });

module.exports = mongoose.model('FoodAllocation', allocSchema);
