const PickupRequest = require('../models/PickupRequest');
const FoodListing = require('../models/FoodListing');
const FoodAllocation = require('../models/FoodAllocation');
const Organization = require('../models/Organization');
const User = require('../models/User');
const NotificationService = require('./NotificationService');
const AuditLog = require('../models/AuditLog');
const PickupService = require('./PickupService');

class AllocationService {
  async createRequest(listingId, ngoOrgId, data, idempotencyKey) {
    if (idempotencyKey) {
      const existing = await PickupRequest.findOne({ idempotencyKey });
      if (existing) return existing;
    }
    const listing = await FoodListing.findById(listingId);
    if (!listing) throw Object.assign(new Error('Listing not found'), { status: 404 });
    if (listing.status !== 'active' || listing.safetyPaused) throw Object.assign(new Error('Listing not available'), { status: 400 });
    if (new Date() > new Date(listing.pickupDeadline)) throw Object.assign(new Error('Pickup deadline passed'), { status: 400 });
    const ngo = await Organization.findById(ngoOrgId);
    if (!ngo || ngo.accountType !== 'receiver' || ngo.verificationStatus !== 'verified') throw Object.assign(new Error('NGO not eligible'), { status: 403 });
    const requested = Number(data.requestedQuantity);
    if (!requested || requested < (listing.minQtyPerNgo || 1)) throw Object.assign(new Error(`Minimum quantity is ${listing.minQtyPerNgo}`), { status: 400 });
    if (requested > listing.availableQuantity) throw Object.assign(new Error('Requested quantity exceeds available'), { status: 400 });
    // duplicate pending request check
    const dup = await PickupRequest.findOne({ listing: listingId, ngo: ngoOrgId, status: 'pending' });
    if (dup) throw Object.assign(new Error('You already have a pending request for this listing'), { status: 409 });
    // capacity check
    if (ngo.capacity && ngo.capacity.dailyReceiveKg > 0) {
      // crude: allow if requested <= dailyReceiveKg
      if (requested > ngo.capacity.dailyReceiveKg) throw Object.assign(new Error('Exceeds NGO daily capacity'), { status: 400 });
    }
    const reqDoc = await PickupRequest.create({
      listing: listingId,
      ngo: ngoOrgId,
      requestedQuantity: requested,
      message: data.message,
      pickupSlot: data.pickupSlot,
      idempotencyKey
    });
    // notify donor
    const donorOrg = await Organization.findById(listing.donor);
    const donorUser = await User.findById(donorOrg.user);
    if (donorUser) await NotificationService.create(donorUser._id, 'new_request', `New request for ${listing.title}: ${requested} ${listing.unit}`, reqDoc._id, 'PickupRequest');
    // auto-approve if mode auto
    if (listing.allocationMode === 'auto') {
      try { await this.approve(reqDoc._id, donorOrg._id, requested, donorUser, 'Auto-approved per donor policy'); } catch (e) { console.error('auto approve failed', e.message); }
    }
    return reqDoc;
  }

  async approve(requestId, donorOrgId, allocatedQty, actorUser, reason) {
    const request = await PickupRequest.findById(requestId);
    if (!request) throw Object.assign(new Error('Request not found'), { status: 404 });
    if (request.status !== 'pending') throw Object.assign(new Error('Request not pending'), { status: 400 });
    const listing = await FoodListing.findById(request.listing);
    if (!listing) throw Object.assign(new Error('Listing not found'), { status: 404 });
    if (String(listing.donor) !== String(donorOrgId)) throw Object.assign(new Error('Forbidden'), { status: 403 });
    if (listing.status !== 'active' || listing.safetyPaused) throw Object.assign(new Error('Listing not available'), { status: 400 });
    const now = new Date();
    if (now > new Date(listing.pickupDeadline)) throw Object.assign(new Error('Pickup deadline passed'), { status: 400 });

    let qty = allocatedQty ? Number(allocatedQty) : request.requestedQuantity;
    if (isNaN(qty) || qty < (listing.minQtyPerNgo || 1)) qty = Math.max(listing.minQtyPerNgo || 1, 1);
    if (qty > request.requestedQuantity) qty = request.requestedQuantity; // cannot allocate more than requested unless extra request flow
    if (qty > listing.availableQuantity) qty = listing.availableQuantity;
    if (qty <= 0) throw Object.assign(new Error('No stock available'), { status: 400 });

    // atomic reservation
    const updated = await FoodListing.findOneAndUpdate(
      { _id: listing._id, availableQuantity: { $gte: qty } },
      { $inc: { availableQuantity: -qty, reservedQuantity: qty } },
      { new: true }
    );
    if (!updated) throw Object.assign(new Error('Insufficient stock (race condition)'), { status: 409 });

    const reservationExpiresAt = new Date(Math.min(new Date(listing.pickupDeadline).getTime(), Date.now() + (Number(process.env.RESERVATION_EXPIRY_MINUTES) || 30) * 60000));

    const alloc = await FoodAllocation.create({
      listing: listing._id,
      request: request._id,
      donor: listing.donor,
      ngo: request.ngo,
      requestedQuantity: request.requestedQuantity,
      allocatedQuantity: qty,
      priorityScore: 0,
      status: 'reserved',
      reservedAt: new Date(),
      reservationExpiresAt
    });

    request.status = 'approved';
    await request.save();

    // generate pickup verification
    const PickupService = require('./PickupService');
    await PickupService.issueVerification(alloc._id, null);

    // update ngo tracking
    const ngo = await Organization.findById(request.ngo);
    if (ngo) { ngo.lastAllocationAt = new Date(); await ngo.save(); }

    // notify ngo
    const ngoUser = await User.findById(ngo.user);
    if (ngoUser) await NotificationService.create(ngoUser._id, 'request_approved', `Your request for ${listing.title} approved: ${qty} ${listing.unit}. Pickup by ${listing.pickupDeadline}.`, alloc._id, 'FoodAllocation');

    await AuditLog.create({ actor: actorUser ? actorUser._id : undefined, action: 'APPROVE_REQUEST', entityType: 'FoodAllocation', entityId: alloc._id, afterState: { allocatedQuantity: qty }, reason });

    return { request, allocation: alloc };
  }

  async reject(requestId, donorOrgId, actorUser, reason) {
    const request = await PickupRequest.findById(requestId);
    if (!request) throw Object.assign(new Error('Request not found'), { status: 404 });
    if (request.status !== 'pending') throw Object.assign(new Error('Request not pending'), { status: 400 });
    const listing = await FoodListing.findById(request.listing);
    if (String(listing.donor) !== String(donorOrgId)) throw Object.assign(new Error('Forbidden'), { status: 403 });
    request.status = 'rejected';
    request.rejectionReason = reason;
    await request.save();
    const ngo = await Organization.findById(request.ngo);
    const ngoUser = await User.findById(ngo.user);
    if (ngoUser) await NotificationService.create(ngoUser._id, 'request_rejected', `Your request for ${listing.title} was rejected. Reason: ${reason || 'N/A'}`, request._id, 'PickupRequest');
    await AuditLog.create({ actor: actorUser ? actorUser._id : undefined, action: 'REJECT_REQUEST', entityType: 'PickupRequest', entityId: request._id, reason });
    return request;
  }

  async cancelByNgo(allocationId, ngoOrgId, reason) {
    const alloc = await FoodAllocation.findById(allocationId);
    if (!alloc) throw Object.assign(new Error('Allocation not found'), { status: 404 });
    if (String(alloc.ngo) !== String(ngoOrgId)) throw Object.assign(new Error('Forbidden'), { status: 403 });
    if (!['reserved','ready_for_pickup'].includes(alloc.status)) throw Object.assign(new Error('Cannot cancel in current status'), { status: 400 });
    const remaining = alloc.allocatedQuantity - alloc.collectedQuantity;
    alloc.status = 'cancelled';
    alloc.cancellationReason = reason;
    await alloc.save();
    // release stock if safe & within deadline
    const listing = await FoodListing.findById(alloc.listing);
    const now = new Date();
    if (listing && listing.status === 'active' && new Date(listing.pickupDeadline) > now && new Date(listing.expiryDate) > now) {
      listing.reservedQuantity = Math.max(0, listing.reservedQuantity - remaining);
      listing.availableQuantity += remaining;
      await listing.save();
    } else {
      listing.closedQuantity += remaining;
      listing.reservedQuantity = Math.max(0, listing.reservedQuantity - remaining);
      await listing.save();
    }
    // update ngo cancellation count
    const ngo = await Organization.findById(alloc.ngo);
    if (ngo) { ngo.cancellations = (ngo.cancellations || 0) + 1; await ngo.save(); }
    const donorOrg = await Organization.findById(alloc.donor);
    const donorUser = await User.findById(donorOrg.user);
    if (donorUser) await NotificationService.create(donorUser._id, 'allocation_cancelled', `NGO cancelled allocation for ${listing.title}. Reason: ${reason || 'N/A'}`, alloc._id, 'FoodAllocation');
    await AuditLog.create({ action: 'NGO_CANCEL_ALLOCATION', entityType: 'FoodAllocation', entityId: alloc._id, reason });
    return alloc;
  }

  async cancelByDonor(allocationId, donorOrgId, reason) {
    const alloc = await FoodAllocation.findById(allocationId);
    if (!alloc) throw Object.assign(new Error('Allocation not found'), { status: 404 });
    if (String(alloc.donor) !== String(donorOrgId)) throw Object.assign(new Error('Forbidden'), { status: 403 });
    if (!['reserved','ready_for_pickup','partially_collected'].includes(alloc.status)) throw Object.assign(new Error('Cannot cancel in current status'), { status: 400 });
    const remaining = alloc.allocatedQuantity - alloc.collectedQuantity;
    alloc.status = 'cancelled';
    alloc.cancellationReason = reason;
    await alloc.save();
    const listing = await FoodListing.findById(alloc.listing);
    const now = new Date();
    if (listing && listing.status === 'active' && new Date(listing.pickupDeadline) > now) {
      listing.reservedQuantity = Math.max(0, listing.reservedQuantity - remaining);
      listing.availableQuantity += remaining;
    } else {
      listing.closedQuantity += remaining;
      listing.reservedQuantity = Math.max(0, listing.reservedQuantity - remaining);
    }
    await listing.save();
    const ngo = await Organization.findById(alloc.ngo);
    const ngoUser = await User.findById(ngo.user);
    if (ngoUser) await NotificationService.create(ngoUser._id, 'allocation_cancelled', `Donor cancelled allocation for ${listing.title}. Reason: ${reason || 'N/A'}`, alloc._id, 'FoodAllocation');
    const donorOrg = await Organization.findById(alloc.donor);
    if (donorOrg) { donorOrg.cancellations = (donorOrg.cancellations || 0) + 1; await donorOrg.save(); }
    await AuditLog.create({ action: 'DONOR_CANCEL_ALLOCATION', entityType: 'FoodAllocation', entityId: alloc._id, reason });
    return alloc;
  }

  async listForDonor(donorOrgId, { status, page = 1, limit = 20 } = {}) {
    const q = { donor: donorOrgId };
    if (status) q.status = status;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      FoodAllocation.find(q).populate('listing', 'title category unit').populate('ngo', 'orgName city').sort({ createdAt: -1 }).skip(skip).limit(limit),
      FoodAllocation.countDocuments(q)
    ]);
    return { items, total, page, limit };
  }

  async listForNgo(ngoOrgId, { status, page = 1, limit = 20 } = {}) {
    const q = { ngo: ngoOrgId };
    if (status) q.status = status;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      FoodAllocation.find(q).populate('listing', 'title category unit pickupDeadline expiryDate pickupAddress location').populate('donor', 'orgName city').sort({ createdAt: -1 }).skip(skip).limit(limit),
      FoodAllocation.countDocuments(q)
    ]);
    return { items, total, page, limit };
  }
}

module.exports = new AllocationService();
module.exports.AllocationService = AllocationService;
