const mongoose = require('mongoose');

const reqSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true, index: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  requestedQuantity: { type: Number, required: true, min: 1 },
  message: { type: String, trim: true },
  pickupSlot: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'expired'], default: 'pending', index: true },
  rejectionReason: String,
  cancellationReason: String,
  idempotencyKey: { type: String, index: true, sparse: true }
}, { timestamps: true });

reqSchema.index({ listing: 1, ngo: 1 });

module.exports = mongoose.model('PickupRequest', reqSchema);
