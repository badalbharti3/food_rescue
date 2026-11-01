const Organization = require('../models/Organization');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const User = require('../models/User');

class VerificationService {
  async listPending() {
    return Organization.find({ verificationStatus: 'pending' }).populate('user', 'name email phone').sort({ createdAt: 1 });
  }

  async verify(orgId, adminUser, reason) {
    const org = await Organization.findById(orgId);
    if (!org) throw Object.assign(new Error('Organization not found'), { status: 404 });
    const before = org.verificationStatus;
    org.verificationStatus = 'verified';
    await org.save();
    await AuditLog.create({ actor: adminUser._id, action: 'VERIFY_ORG', entityType: 'Organization', entityId: org._id, beforeState: { status: before }, afterState: { status: 'verified' }, reason });
    // notify user
    const u = await User.findById(org.user);
    if (u) await Notification.create({ recipient: u._id, type: 'verification_approved', message: `Your organization ${org.orgName} has been verified.` });
    return org;
  }

  async reject(orgId, adminUser, reason) {
    const org = await Organization.findById(orgId);
    if (!org) throw Object.assign(new Error('Organization not found'), { status: 404 });
    const before = org.verificationStatus;
    org.verificationStatus = 'rejected';
    await org.save();
    await AuditLog.create({ actor: adminUser._id, action: 'REJECT_ORG', entityType: 'Organization', entityId: org._id, beforeState: { status: before }, afterState: { status: 'rejected' }, reason });
    const u = await User.findById(org.user);
    if (u) await Notification.create({ recipient: u._id, type: 'verification_rejected', message: `Your organization ${org.orgName} verification was rejected. Reason: ${reason || 'N/A'}` });
    return org;
  }

  async suspend(orgId, adminUser, reason) {
    const org = await Organization.findById(orgId);
    if (!org) throw Object.assign(new Error('Organization not found'), { status: 404 });
    org.verificationStatus = 'suspended';
    org.suspensionReason = reason;
    await org.save();
    await AuditLog.create({ actor: adminUser._id, action: 'SUSPEND_ORG', entityType: 'Organization', entityId: org._id, reason });
    const u = await User.findById(org.user);
    if (u) await Notification.create({ recipient: u._id, type: 'account_suspended', message: `Your organization has been suspended. Reason: ${reason || 'N/A'}` });
    return org;
  }
}

module.exports = new VerificationService();
