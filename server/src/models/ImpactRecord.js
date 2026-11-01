const mongoose = require('mongoose');

const impactSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing' },
  allocation: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodAllocation' },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  actualCollectedQuantity: { type: Number, required: true },
  unit: String,
  city: String,
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ImpactRecord', impactSchema);
