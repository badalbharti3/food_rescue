const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing' },
  allocation: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodAllocation' },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  incidentType: { type: String, required: true },
  description: { type: String, required: true },
  evidence: [String],
  status: { type: String, enum: ['open', 'investigating', 'resolved', 'closed'], default: 'open', index: true },
  resolution: String,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
