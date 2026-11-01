const AdditionalQuantityRequest = require('../models/AdditionalQuantityRequest');
const FoodAllocation = require('../models/FoodAllocation');
const FoodListing = require('../models/FoodListing');
const Organization = require('../models/Organization');
const User = require('../models/User');
const NotificationService = require('./NotificationService');
const AllocationService = require('./AllocationService');
const AuditLog = require('../models/AuditLog');

class AdditionalQuantityService {
  async request(allocationId, ngoOrgId, additionalQty, reason) {
    const alloc = await FoodAllocation.findById(allocationId);
    if (!alloc) throw Object.assign(new Error('Allocation not found'), { status: 404 });
    if (String(alloc.ngo) !== String(ngoOrgId)) throw Object.assign(new Error('Forbidden'), { status: 403 });
    if (!alloc.listing) throw Object.assign(new Error('No listing'), { status: 400 });
    const listing = await FoodListing.findById(alloc.listing);
    if (!listing || listing.status !== 'active') throw Object.assign(new Error('Listing not available'), { status: 400 });
    const aq = await AdditionalQuantityRequest.create({
      allocation: allocationId,
      listing: listing._id,
      ngo: ngoOrgId,
      additionalQuantity: Number(additionalQty),
      reason,
      status: 'pending'
    });
    const donorOrg = await Organization.findById(alloc.donor);
    const donorUser = await User.findById(donorOrg.user);
    if (donorUser) await NotificationService.create(donorUser._id, 'additional_qty_request', `NGO requests additional ${additionalQty} ${listing.unit} for ${listing.title}.`, aq._id, 'AdditionalQuantityRequest');
    return aq;
  }

  async approve(aqId, donorOrgId, approvedQty, actorUser) {
    const aq = await AdditionalQuantityRequest.findById(aqId);
    if (!aq || aq.status !== 'pending') throw Object.assign(new Error('Request not pending'), { status: 400 });
    const alloc = await FoodAllocation.findById(aq.allocation);
    const listing = await FoodListing.findById(aq.listing);
    if (String(listing.donor) !== String(donorOrgId)) throw Object.assign(new Error('Forbidden'), { status: 403 });
    let qty = approvedQty ? Number(approvedQty) : aq.additionalQuantity;
    if (qty > listing.availableQuantity) qty = listing.availableQuantity;
    if (qty <= 0) {
      aq.status = 'rejected';
      aq.reason = (aq.reason || '') + ' | Insufficient stock';
      await aq.save();
      const ngo = await Organization.findById(aq.ngo);
      const ngoUser = await User.findById(ngo.user);
      if (ngoUser) await NotificationService.create(ngoUser._id, 'additional_qty_rejected', `Additional quantity request rejected: insufficient stock.`, aq._id, 'AdditionalQuantityRequest');
      return aq;
    }
    // partial offer
    if (qty < aq.additionalQuantity) {
      aq.status = 'partial_offered';
    } else {
      aq.status = 'approved';
    }
    aq.approvedQuantity = qty;
    // reserve stock
    const updated = await FoodListing.findOneAndUpdate(
      { _id: listing._id, availableQuantity: { $gte: qty } },
      { $inc: { availableQuantity: -qty, reservedQuantity: qty } },
      { new: true }
    );
    if (!updated) {
      aq.status = 'rejected';
      await aq.save();
      throw Object.assign(new Error('Insufficient stock (race)'), { status: 409 });
    }
    // create new allocation linked
    const newAlloc = await FoodAllocation.create({
      listing: listing._id,
      donor: listing.donor,
      ngo: aq.ngo,
      requestedQuantity: aq.additionalQuantity,
      allocatedQuantity: qty,
      status: 'reserved',
      reservedAt: new Date(),
      reservationExpiresAt: new Date(Math.min(new Date(listing.pickupDeadline).getTime(), Date.now() + 30*60000)),
      isAdditional: true,
      parentAllocation: alloc._id
    });
    aq.newAllocation = newAlloc._id;
    await aq.save();
    const PickupService = require('./PickupService');
    await PickupService.issueVerification(newAlloc._id, null);
    const ngo = await Organization.findById(aq.ngo);
    const ngoUser = await User.findById(ngo.user);
    if (ngoUser) await NotificationService.create(ngoUser._id, 'additional_qty_approved', `Additional ${qty} ${listing.unit} approved.`, newAlloc._id, 'FoodAllocation');
    await AuditLog.create({ actor: actorUser ? actorUser._id : undefined, action: 'APPROVE_ADDITIONAL_QTY', entityType: 'AdditionalQuantityRequest', entityId: aq._id, afterState: { approved: qty } });
    return { aq, allocation: newAlloc };
  }

  async reject(aqId, donorOrgId, actorUser, reason) {
    const aq = await AdditionalQuantityRequest.findById(aqId);
    if (!aq || aq.status !== 'pending') throw Object.assign(new Error('Request not pending'), { status: 400 });
    const listing = await FoodListing.findById(aq.listing);
    if (String(listing.donor) !== String(donorOrgId)) throw Object.assign(new Error('Forbidden'), { status: 403 });
    aq.status = 'rejected';
    aq.reason = (aq.reason || '') + (reason ? ` | ${reason}` : '');
    await aq.save();
    const ngo = await Organization.findById(aq.ngo);
    const ngoUser = await User.findById(ngo.user);
    if (ngoUser) await NotificationService.create(ngoUser._id, 'additional_qty_rejected', `Additional quantity request rejected. Reason: ${reason || 'N/A'}`, aq._id, 'AdditionalQuantityRequest');
    await AuditLog.create({ actor: actorUser ? actorUser._id : undefined, action: 'REJECT_ADDITIONAL_QTY', entityType: 'AdditionalQuantityRequest', entityId: aq._id, reason });
    return aq;
  }

  async listForNgo(ngoOrgId) {
    return AdditionalQuantityRequest.find({ ngo: ngoOrgId }).populate('listing', 'title unit').populate('allocation').sort({ createdAt: -1 });
  }

  async listForDonor(donorOrgId) {
    // need listings by donor
    const listings = await FoodListing.find({ donor: donorOrgId }).select('_id');
    const ids = listings.map(l => l._id);
    return AdditionalQuantityRequest.find({ listing: { $in: ids } }).populate('listing', 'title unit').sort({ createdAt: -1 });
  }
}

module.exports = new AdditionalQuantityService();
// lazy PickupService
const PickupService = require('./PickupService');
// patch issueVerification usage: AdditionalQuantityService already references PickupService global? It references PickupService without require. Need global.
global.PickupService = PickupService;
