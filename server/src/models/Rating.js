const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  allocation: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodAllocation', required: true, index: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing' },
  direction: { type: String, enum: ['donor_to_ngo', 'ngo_to_donor'], required: true },
  fromOrg: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  toOrg: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  stars: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true, maxlength: 500 }
}, { timestamps: true });

// one review per direction per allocation
ratingSchema.index({ allocation: 1, direction: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
