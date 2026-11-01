const crypto = require('crypto');
const PickupVerification = require('../models/PickupVerification');
const FoodAllocation = require('../models/FoodAllocation');
const FoodListing = require('../models/FoodListing');
const Organization = require('../models/Organization');
const User = require('../models/User');
const NotificationService = require('./NotificationService');
const AuditLog = require('../models/AuditLog');
const ImpactRecord = require('../models/ImpactRecord');

class PickupService {
  generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  hashOtp(otp) {
    return crypto.createHash('sha256').update(otp + (process.env.JWT_SECRET || '')).digest('hex');
  }

  async issueVerification(allocationId, authorizedCollector) {
    const alloc = await FoodAllocation.findById(allocationId);
    if (!alloc) throw Object.assign(new Error('Allocation not found'), { status: 404 });
    // remove existing issued
    await PickupVerification.deleteMany({ allocation: allocationId, status: 'issued' });
    const otp = this.generateOtp();
    const otpHash = this.hashOtp(otp);
    const expiry = new Date(Date.now() + (Number(process.env.OTP_EXPIRY_MINUTES) || 10) * 60000);
    const pv = await PickupVerification.create({
      allocation: allocationId,
      otpHash,
      otpExpiresAt: expiry,
      authorizedCollector: authorizedCollector || '',
      status: 'issued'
    });
    alloc.otpExpiresAt = expiry;
    alloc.status = 'ready_for_pickup';
    await alloc.save();
    // notify ngo with OTP (in real app send SMS; here in-app)
    const ngo = await Organization.findById(alloc.ngo);
    const ngoUser = await User.findById(ngo.user);
    if (ngoUser) await NotificationService.create(ngoUser._id, 'pickup_otp', `Pickup OTP for ${alloc.allocatedQuantity} units: ${otp}. Valid until ${expiry.toLocaleString()}.`, alloc._id, 'FoodAllocation');
    const donorOrg = await Organization.findById(alloc.donor);
    const donorUser = await User.findById(donorOrg.user);
    if (donorUser) await NotificationService.create(donorUser._id, 'pickup_scheduled', `Pickup scheduled for ${alloc.allocatedQuantity} units. OTP issued to NGO.`, alloc._id, 'FoodAllocation');
    // return otp only in dev response? We'll return masked; but for demo include otp in response (not production). We'll return otp to caller for testing.
    return { verification: pv, otp };
  }

  async verifyPickup(allocationId, otp, actualCollected, collectorName, actorUser) {
    const alloc = await FoodAllocation.findById(allocationId);
    if (!alloc) throw Object.assign(new Error('Allocation not found'), { status: 404 });
    if (!['reserved','ready_for_pickup','partially_collected'].includes(alloc.status)) throw Object.assign(new Error('Allocation not in pickup state'), { status: 400 });
    const pv = await PickupVerification.findOne({ allocation: allocationId, status: 'issued' }).sort({ createdAt: -1 });
    if (!pv) throw Object.assign(new Error('No active OTP'), { status: 400 });
    if (new Date() > pv.otpExpiresAt) {
      pv.status = 'expired';
      await pv.save();
      throw Object.assign(new Error('OTP expired'), { status: 400 });
    }
    if (this.hashOtp(otp) !== pv.otpHash) {
      throw Object.assign(new Error('Invalid OTP'), { status: 400 });
    }
    const collected = Number(actualCollected);
    if (isNaN(collected) || collected < 0 || collected > alloc.allocatedQuantity) throw Object.assign(new Error('Invalid collected quantity'), { status: 400 });

    pv.status = 'verified';
    pv.verifiedAt = new Date();
    pv.actualCollectedQuantity = collected;
    pv.authorizedCollector = collectorName || pv.authorizedCollector;
    await pv.save();

    alloc.collectedQuantity = collected;
    const remaining = alloc.allocatedQuantity - collected;
    if (collected === alloc.allocatedQuantity) {
      alloc.status = 'completed';
    } else if (collected > 0) {
      alloc.status = 'partially_collected';
    } else {
      alloc.status = 'partially_collected';
    }
    alloc.verifiedAt = new Date();
    alloc.authorizedCollector = collectorName || alloc.authorizedCollector;
    await alloc.save();

    // update listing quantities
    const listing = await FoodListing.findById(alloc.listing);
    if (listing) {
      listing.collectedQuantity += collected;
      listing.reservedQuantity = Math.max(0, listing.reservedQuantity - collected);
      if (remaining > 0) {
        // keep remaining reserved unless released; if partial, leave reserved for now (release via workflow)
        // We'll mark remaining as still reserved; donor can release
      }
      await listing.save();
    }
    // update ngo stats
    const ngo = await Organization.findById(alloc.ngo);
    if (ngo) { ngo.totalReceivedKg += collected; ngo.completedPickups = (ngo.completedPickups || 0) + 1; await ngo.save(); }
    // impact record
    await ImpactRecord.create({ listing: alloc.listing, allocation: alloc._id, donor: alloc.donor, ngo: alloc.ngo, actualCollectedQuantity: collected, unit: listing ? listing.unit : 'packets', city: listing ? listing.city : '' });
    // notify both
    const donorOrg = await Organization.findById(alloc.donor);
    const donorUser = await User.findById(donorOrg.user);
    if (donorUser) await NotificationService.create(donorUser._id, 'pickup_completed', `Pickup completed: ${collected} units collected (of ${alloc.allocatedQuantity}).`, alloc._id, 'FoodAllocation');
    if (ngo && ngo.user) {
      const ngoUser = await User.findById(ngo.user);
      if (ngoUser) await NotificationService.create(ngoUser._id, 'pickup_completed', `Pickup recorded: ${collected} units.`, alloc._id, 'FoodAllocation');
    }
    await AuditLog.create({ actor: actorUser ? actorUser._id : undefined, action: 'VERIFY_PICKUP', entityType: 'FoodAllocation', entityId: alloc._id, afterState: { collected }, reason: collected < alloc.allocatedQuantity ? 'partial collection' : 'full collection' });
    return { allocation: alloc, collected, remaining };
  }

  async releaseRemaining(allocationId, actorUser, reason) {
    const alloc = await FoodAllocation.findById(allocationId);
    if (!alloc) throw Object.assign(new Error('Allocation not found'), { status: 404 });
    const remaining = alloc.allocatedQuantity - alloc.collectedQuantity;
    if (remaining <= 0) return alloc;
    alloc.releasedQuantity = (alloc.releasedQuantity || 0) + remaining;
    alloc.status = 'released';
    await alloc.save();
    const listing = await FoodListing.findById(alloc.listing);
    const now = new Date();
    if (listing && listing.status === 'active' && new Date(listing.pickupDeadline) > now && new Date(listing.expiryDate) > now) {
      listing.reservedQuantity = Math.max(0, listing.reservedQuantity - remaining);
      listing.availableQuantity += remaining;
    } else {
      listing.closedQuantity += remaining;
      listing.reservedQuantity = Math.max(0, listing.reservedQuantity - remaining);
    }
    await listing.save();
    await AuditLog.create({ actor: actorUser ? actorUser._id : undefined, action: 'RELEASE_REMAINING', entityType: 'FoodAllocation', entityId: alloc._id, reason });
    return alloc;
  }
}

module.exports = new PickupService();
