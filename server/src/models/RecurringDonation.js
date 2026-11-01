const mongoose = require('mongoose');

const recurringSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  outlet: { type: mongoose.Schema.Types.ObjectId, ref: 'Outlet' },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: String, required: true },
  totalQuantity: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'packets' },
  pickupAddress: { type: String, trim: true },
  city: { type: String, trim: true },
  lng: Number,
  lat: Number,
  // how fresh the food is: listing expires this many hours after generation
  expiryHours: { type: Number, default: 12, min: 1, max: 72 },
  // weekly schedule: 0 = Sunday ... 6 = Saturday
  dayOfWeek: { type: Number, min: 0, max: 6, required: true },
  hour: { type: Number, min: 0, max: 23, default: 18 },
  active: { type: Boolean, default: true },
  lastRunAt: Date,
  createdCount: { type: Number, default: 0 },
  lastListing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing' }
}, { timestamps: true });

module.exports = mongoose.model('RecurringDonation', recurringSchema);
