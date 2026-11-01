const mongoose = require('mongoose');

const aqSchema = new mongoose.Schema({
  allocation: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodAllocation', required: true, index: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  additionalQuantity: { type: Number, required: true, min: 1 },
  approvedQuantity: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'partial_offered', 'cancelled'], default: 'pending', index: true },
  reason: String,
  newAllocation: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodAllocation' }
}, { timestamps: true });

module.exports = mongoose.model('AdditionalQuantityRequest', aqSchema);
