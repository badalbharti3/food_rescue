const User = require('../models/User');
const Organization = require('../models/Organization');
const FoodListing = require('../models/FoodListing');
const FoodAllocation = require('../models/FoodAllocation');
const PickupRequest = require('../models/PickupRequest');
const Dispute = require('../models/Dispute');
const AuditLog = require('../models/AuditLog');
const ImpactRecord = require('../models/ImpactRecord');
const Notification = require('../models/Notification');

class AdminService {
  async stats() {
    const [donors, receivers, pendingVerif, listings, activeListings, allocations, completed, expired, disputes, incidents] = await Promise.all([
      Organization.countDocuments({ accountType: 'donor' }),
      Organization.countDocuments({ accountType: 'receiver', verificationStatus: 'verified' }),
      Organization.countDocuments({ verificationStatus: 'pending' }),
      FoodListing.countDocuments(),
      FoodListing.countDocuments({ status: 'active' }),
      FoodAllocation.countDocuments(),
      FoodAllocation.countDocuments({ status: 'completed' }),
      FoodListing.countDocuments({ status: 'expired' }),
      Dispute.countDocuments({ status: 'open' }),
      Dispute.countDocuments()
    ]);
    const impact = await ImpactRecord.aggregate([{ $group: { _id: null, total: { $sum: '$actualCollectedQuantity' } } }]);
    const totalCollected = impact.length ? impact[0].total : 0;
    return { donors, receivers, pendingVerif, listings, activeListings, allocations, completed, expired, disputes, incidents, totalCollected };
  }

  async analyticsByCity() {
    return ImpactRecord.aggregate([
      { $group: { _id: '$city', total: { $sum: '$actualCollectedQuantity' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
  }

  async listUsers({ role, page = 1, limit = 20, search }) {
    const q = {};
    if (role) q.role = role;
    if (search) q.email = new RegExp(search, 'i');
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([User.find(q).select('-passwordHash').skip(skip).limit(limit).sort({ createdAt: -1 }), User.countDocuments(q)]);
    return { items, total, page, limit };
  }

  async listOrgs({ accountType, status, page = 1, limit = 20, search }) {
    const q = {};
    if (accountType) q.accountType = accountType;
    if (status) q.verificationStatus = status;
    if (search) q.orgName = new RegExp(search, 'i');
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([Organization.find(q).populate('user', 'name email').skip(skip).limit(limit).sort({ createdAt: -1 }), Organization.countDocuments(q)]);
    return { items, total, page, limit };
  }

  async listListings({ status, page = 1, limit = 20 }) {
    const q = {};
    if (status) q.status = status;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([FoodListing.find(q).populate('donor', 'orgName city').skip(skip).limit(limit).sort({ createdAt: -1 }), FoodListing.countDocuments(q)]);
    return { items, total, page, limit };
  }

  async listAllocations({ status, page = 1, limit = 20 }) {
    const q = {};
    if (status) q.status = status;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([FoodAllocation.find(q).populate('listing', 'title').populate('donor', 'orgName').populate('ngo', 'orgName').skip(skip).limit(limit).sort({ createdAt: -1 }), FoodAllocation.countDocuments(q)]);
    return { items, total, page, limit };
  }

  async manualReallocate(allocationId, newNgoId, adminUser, reason) {
    const alloc = await FoodAllocation.findById(allocationId);
    if (!alloc) throw Object.assign(new Error('Allocation not found'), { status: 404 });
    const oldNgo = alloc.ngo;
    // release old
    const remaining = alloc.allocatedQuantity - alloc.collectedQuantity;
    const listing = await FoodListing.findById(alloc.listing);
    // cancel old
    alloc.status = 'cancelled';
    alloc.cancellationReason = 'Manual reallocation by admin';
    await alloc.save();
    listing.reservedQuantity = Math.max(0, listing.reservedQuantity - remaining);
    listing.availableQuantity += remaining;
    await listing.save();
    // create new allocation for new ngo (reserve)
    const updated = await FoodListing.findOneAndUpdate(
      { _id: listing._id, availableQuantity: { $gte: remaining } },
      { $inc: { availableQuantity: -remaining, reservedQuantity: remaining } },
      { new: true }
    );
    if (!updated) throw Object.assign(new Error('Insufficient stock'), { status: 409 });
    const newAlloc = await FoodAllocation.create({
      listing: listing._id,
      donor: alloc.donor,
      ngo: newNgoId,
      requestedQuantity: remaining,
      allocatedQuantity: remaining,
      status: 'reserved',
      reservedAt: new Date(),
      reservationExpiresAt: alloc.reservationExpiresAt
    });
    const PickupService = require('./PickupService');
    await PickupService.issueVerification(newAlloc._id, null);
    await AuditLog.create({ actor: adminUser._id, action: 'MANUAL_REALLOCATE', entityType: 'FoodAllocation', entityId: newAlloc._id, beforeState: { oldAllocation: allocationId, oldNgo }, afterState: { newAllocation: newAlloc._id, newNgo: newNgoId }, reason });
    return newAlloc;
  }

  async auditLogs({ page = 1, limit = 50 }) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([AuditLog.find().populate('actor', 'name email role').sort({ createdAt: -1 }).skip(skip).limit(limit), AuditLog.countDocuments()]);
    return { items, total, page, limit };
  }

  async opsMap() {
    const [listings, ngos] = await Promise.all([
      FoodListing.find({ status: 'active' }).populate('donor', 'orgName').sort({ pickupDeadline: 1 }),
      Organization.find(
        { accountType: 'receiver', verificationStatus: 'verified' },
        'orgName city location capacity totalReceivedKg completedPickups missedPickups serviceRadiusKm'
      )
    ]);
    return {
      listings: listings.map((l) => ({
        _id: l._id,
        title: l.title,
        category: l.category,
        city: l.city,
        availableQuantity: l.availableQuantity,
        unit: l.unit,
        expiryDate: l.expiryDate,
        pickupDeadline: l.pickupDeadline,
        donor: l.donor?.orgName || null,
        coordinates: l.location?.coordinates || [0, 0]
      })),
      ngos: ngos.map((n) => ({
        _id: n._id,
        orgName: n.orgName,
        city: n.city,
        coordinates: n.location?.coordinates || [0, 0],
        dailyReceiveKg: n.capacity?.dailyReceiveKg || 0,
        totalReceivedKg: n.totalReceivedKg || 0,
        completedPickups: n.completedPickups || 0,
        missedPickups: n.missedPickups || 0,
        serviceRadiusKm: n.serviceRadiusKm || 0
      }))
    };
  }

  async removeDonor(orgId, adminUser, reason) {
    const org = await Organization.findById(orgId);
    if (!org || org.accountType !== 'donor') throw Object.assign(new Error('Donor org not found'), { status: 404 });
    // Remove all of the donor's listings from the donor list and discovery
    const FoodListing = require('../models/FoodListing');
    const FoodListingService = require('./FoodListingService');
    const allListings = await FoodListing.find({ donor: orgId });
    for (const l of allListings) {
      if (l.status === 'active') {
        await FoodListingService.cancel(l._id, orgId, reason || 'Donor removed by admin', adminUser);
      } else {
        // Mark non-active listings as cancelled too so they no longer appear
        l.status = 'cancelled';
        l.closedQuantity += l.availableQuantity + l.reservedQuantity;
        l.availableQuantity = 0;
        l.reservedQuantity = 0;
        await l.save();
      }
    }
    // Hard-delete cancelled listings so they disappear from the donor's list
    await FoodListing.deleteMany({ donor: orgId, status: 'cancelled' });
    // deactivate user
    const User = require('../models/User');
    const user = await User.findById(org.user);
    if (user) { user.isActive = false; await user.save(); }
    org.verificationStatus = 'suspended';
    org.suspensionReason = reason || 'Removed by admin';
    await org.save();
    await AuditLog.create({ actor: adminUser._id, action: 'REMOVE_DONOR', entityType: 'Organization', entityId: org._id, reason: reason || 'Removed by admin' });
    return { removed: true, orgId };
  }
}

module.exports = new AdminService();
