const mongoose = require('mongoose');

const notifSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true, index: true },
  message: { type: String, required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  referenceType: String,
  readAt: Date,
  deliveryStatus: { type: String, enum: ['pending', 'sent', 'failed'], default: 'sent' },
  idempotencyKey: { type: String, index: true, sparse: true }
}, { timestamps: true });

notifSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notifSchema);
