const mongoose = require('mongoose');

const pvSchema = new mongoose.Schema({
  allocation: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodAllocation', required: true, index: true },
  otpHash: { type: String, required: true },
  otpExpiresAt: { type: Date, required: true },
  authorizedCollector: { type: String, trim: true },
  verifiedAt: Date,
  actualCollectedQuantity: { type: Number, default: 0 },
  evidence: String,
  discrepancyNote: String,
  status: { type: String, enum: ['issued', 'verified', 'expired', 'failed'], default: 'issued' }
}, { timestamps: true });

module.exports = mongoose.model('PickupVerification', pvSchema);
