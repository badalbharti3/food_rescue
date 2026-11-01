const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true, index: true },
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  beforeState: mongoose.Schema.Types.Mixed,
  afterState: mongoose.Schema.Types.Mixed,
  reason: String,
  ip: String
}, { timestamps: true });

auditSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditSchema);
