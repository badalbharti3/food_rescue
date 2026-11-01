const FoodListing = require('../models/FoodListing');
const Organization = require('../models/Organization');
const Notification = require('../models/Notification');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const NotificationService = require('./NotificationService');
const MatchingService = require('./MatchingService');

class FoodListingService {
  async create(donorOrgId, data, idempotencyKey) {
    if (idempotencyKey) {
      const existing = await FoodListing.findOne({ idempotencyKey });
      if (existing) return existing;
    }
    const org = await Organization.findById(donorOrgId);
    if (!org) throw Object.assign(new Error('Donor org not found'), { status: 404 });
    if (org.verificationStatus !== 'verified') throw Object.assign(new Error('Donor organization not verified'), { status: 403 });
    const total = Number(data.totalQuantity);
    if (isNaN(total) || total < 0) throw Object.assign(new Error('Invalid quantity'), { status: 400 });
    const expiry = new Date(data.expiryDate);
    const deadline = new Date(data.pickupDeadline);
    if (expiry <= new Date()) throw Object.assign(new Error('Expiry must be in future'), { status: 400 });
    if (deadline > expiry) throw Object.assign(new Error('Pickup deadline cannot be after expiry'), { status: 400 });
    const listing = await FoodListing.create({
      donor: donorOrgId,
      outlet: data.outletId || undefined,
      title: data.title,
      description: data.description,
      category: data.category,
      totalQuantity: total,
      availableQuantity: total,
      reservedQuantity: 0,
      collectedQuantity: 0,
      closedQuantity: 0,
      unit: data.unit || 'packets',
      servingSize: data.servingSize,
      prepTime: data.prepTime ? new Date(data.prepTime) : undefined,
      availableFrom: data.availableFrom ? new Date(data.availableFrom) : new Date(),
      expiryDate: expiry,
      pickupDeadline: deadline,
      pickupAddress: data.pickupAddress || org.address,
      location: { type: 'Point', coordinates: [data.lng || org.location.coordinates[0] || 0, data.lat || org.location.coordinates[1] || 0] },
      city: data.city || org.city,
      storageRequirements: data.storageRequirements,
      temperatureRequirements: data.temperatureRequirements,
      packagingCondition: data.packagingCondition,
      ingredients: data.ingredients,
      allergens: data.allergens,
      imageUrls: data.imageUrls || [],
      allocationMode: data.allocationMode || org.allocationDefaults.mode || 'review',
      minQtyPerNgo: data.minQtyPerNgo || org.allocationDefaults.minQtyPerNgo || 1,
      maxNgos: data.maxNgos || org.allocationDefaults.maxNgos || 5,
      partialAllowed: data.partialAllowed !== undefined ? data.partialAllowed : (org.allocationDefaults.partialAllowed !== undefined ? org.allocationDefaults.partialAllowed : true),
      maxMatchDistanceKm: data.maxMatchDistanceKm || org.allocationDefaults.maxMatchDistanceKm || 25,
      requestResponseDeadline: data.requestResponseDeadline ? new Date(data.requestResponseDeadline) : undefined,
      pickupSlots: data.pickupSlots || [],
      allowAdditionalRequests: data.allowAdditionalRequests !== undefined ? data.allowAdditionalRequests : (org.allocationDefaults.allowAdditionalRequests !== undefined ? org.allocationDefaults.allowAdditionalRequests : true),
      preferredNgo: data.preferredNgo || undefined,
      specialInstructions: data.specialInstructions,
      idempotencyKey
    });
    // notify matched NGOs
    this.notifyMatched(listing, org).catch(() => {});
    return listing;
  }

  async notifyMatched(listing, donorOrg) {
    try {
      if (!listing || listing.status !== 'active') return;
      const eligible = await MatchingService.findEligibleNgos(listing, donorOrg);
      for (const { ngo, distanceKm } of eligible.slice(0, 20)) {
        const away = distanceKm != null ? ` (~${distanceKm} km from you)` : ` in ${listing.city || 'your city'}`;
        const u = await User.findById(ngo.user);
        if (u) await NotificationService.create(u._id, 'new_nearby_listing', `New food donation available${away}: ${listing.title} (${listing.availableQuantity} ${listing.unit})`, listing._id, 'FoodListing');
      }
    } catch (e) {
      console.error('notifyMatched failed', e.message);
    }
  }

  async getById(id) {
    const l = await FoodListing.findById(id).populate('donor', 'orgName city location phone').populate('outlet');
    if (!l) throw Object.assign(new Error('Listing not found'), { status: 404 });
    return l;
  }

  async listByDonor(donorOrgId, { status, page = 1, limit = 20 } = {}) {
    const q = { donor: donorOrgId };
    if (status) q.status = status;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      FoodListing.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit),
      FoodListing.countDocuments(q)
    ]);
    return { items, total, page, limit };
  }

  async listForNgo({ ngoOrg, filters = {}, page = 1, limit = 20 } = {}) {
    const q = { status: 'active', safetyPaused: false, availableQuantity: { $gt: 0 } };
    if (filters.category) q.category = filters.category;
    if (filters.city) q.city = filters.city;
    if (filters.minQty) q.availableQuantity = { $gte: Number(filters.minQty) };
    q.expiryDate = { $gt: new Date() };
    q.pickupDeadline = { $gt: new Date() };
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      FoodListing.find(q).populate('donor', 'orgName city location').sort({ createdAt: -1 }).skip(skip).limit(limit * 3),
      FoodListing.countDocuments(q)
    ]);
    // Enforce donor-specified max matching distance
    const haversine = require('./MatchingService').haversineKm || ((lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
      return 2 * R * Math.asin(Math.sqrt(a));
    });
    const ngoCoords = ngoOrg && ngoOrg.location && ngoOrg.location.coordinates ? ngoOrg.location.coordinates : [0,0];
    const [nLng, nLat] = ngoCoords;
    const filtered = items.filter((l) => {
      const coords = l.location && l.location.coordinates ? l.location.coordinates : (l.donor && l.donor.location ? l.donor.location.coordinates : [0,0]);
      const [lLng, lLat] = coords;
      const dist = haversine(nLat, nLng, lLat, lLng);
      const maxDist = l.maxMatchDistanceKm || 25;
      return dist <= maxDist;
    }).slice(0, limit);
    return { items: filtered, total: filtered.length, page, limit };
  }

  async listNearbyForNgo(ngoOrg, maxDistanceKm = 25) {
    const coords = ngoOrg.location.coordinates;
    const listings = await FoodListing.find({
      status: 'active', safetyPaused: false, availableQuantity: { $gt: 0 },
      expiryDate: { $gt: new Date() }, pickupDeadline: { $gt: new Date() },
      location: { $near: { $geometry: { type: 'Point', coordinates: coords }, $maxDistance: maxDistanceKm * 1000 } }
    }).populate('donor', 'orgName city location').limit(50);
    // Enforce donor-specified max matching distance
    const [nLng, nLat] = coords;
    const haversine = require('./MatchingService').haversineKm;
    return listings.filter((l) => {
      const lCoords = l.location && l.location.coordinates ? l.location.coordinates : [0,0];
      const [lLng, lLat] = lCoords;
      const dist = typeof haversine === 'function' ? haversine(nLat, nLng, lLat, lLng) : 0;
      return dist <= (l.maxMatchDistanceKm || 25);
    });
  }

  async update(id, donorOrgId, data, reason) {
    const listing = await FoodListing.findById(id);
    if (!listing) throw Object.assign(new Error('Listing not found'), { status: 404 });
    if (String(listing.donor) !== String(donorOrgId)) throw Object.assign(new Error('Forbidden'), { status: 403 });
    // cannot silently reduce approved quantity; if changing totalQuantity, must adjust available only and not below reserved
    const before = { totalQuantity: listing.totalQuantity, availableQuantity: listing.availableQuantity, reservedQuantity: listing.reservedQuantity };
    if (data.totalQuantity !== undefined) {
      const newTotal = Number(data.totalQuantity);
      const allocated = listing.reservedQuantity + listing.collectedQuantity + listing.closedQuantity;
      if (newTotal < allocated) throw Object.assign(new Error('Cannot reduce total below allocated quantity. Use cancellation workflow.'), { status: 400 });
      const diff = newTotal - listing.totalQuantity;
      listing.totalQuantity = newTotal;
      listing.availableQuantity = Math.max(0, listing.availableQuantity + diff);
    }
    const fields = ['title','description','category','unit','servingSize','storageRequirements','temperatureRequirements','packagingCondition','ingredients','allergens','imageUrls','allocationMode','minQtyPerNgo','maxNgos','partialAllowed','maxMatchDistanceKm','pickupSlots','allowAdditionalRequests','specialInstructions','status'];
    for (const f of fields) if (data[f] !== undefined) listing[f] = data[f];
    if (data.expiryDate) listing.expiryDate = new Date(data.expiryDate);
    if (data.pickupDeadline) listing.pickupDeadline = new Date(data.pickupDeadline);
    if (data.availableFrom) listing.availableFrom = new Date(data.availableFrom);
    if (data.prepTime) listing.prepTime = new Date(data.prepTime);
    await listing.save();
    await AuditLog.create({ action: 'UPDATE_LISTING', entityType: 'FoodListing', entityId: listing._id, beforeState: before, afterState: { totalQuantity: listing.totalQuantity, availableQuantity: listing.availableQuantity }, reason });
    return listing;
  }

  async pause(id, donorOrgId, reason) {
    const listing = await FoodListing.findById(id);
    if (!listing) throw Object.assign(new Error('Listing not found'), { status: 404 });
    if (String(listing.donor) !== String(donorOrgId)) throw Object.assign(new Error('Forbidden'), { status: 403 });
    listing.status = 'paused';
    await listing.save();
    await AuditLog.create({ action: 'PAUSE_LISTING', entityType: 'FoodListing', entityId: listing._id, reason });
    return listing;
  }

  async cancel(id, donorOrgId, reason, adminUser) {
    const listing = await FoodListing.findById(id);
    if (!listing) throw Object.assign(new Error('Listing not found'), { status: 404 });
    if (donorOrgId && String(listing.donor) !== String(donorOrgId)) throw Object.assign(new Error('Forbidden'), { status: 403 });
    // cancel active allocations
    const FoodAllocation = require('../models/FoodAllocation');
    const allocs = await FoodAllocation.find({ listing: id, status: { $in: ['reserved','ready_for_pickup','partially_collected'] } });
    for (const a of allocs) {
      a.status = 'cancelled';
      a.cancellationReason = reason || 'Listing cancelled by donor';
      await a.save();
      // release stock? mark closed
      const u = await User.findById((await (require('../models/Organization').findById(a.ngo))).user);
      if (u) await NotificationService.create(u._id, 'allocation_cancelled', `Allocation for ${listing.title} cancelled. Reason: ${reason || 'N/A'}`, a._id, 'FoodAllocation');
    }
    listing.status = 'cancelled';
    listing.closedQuantity += listing.availableQuantity + listing.reservedQuantity;
    listing.availableQuantity = 0;
    listing.reservedQuantity = 0;
    await listing.save();
    await AuditLog.create({ actor: adminUser ? adminUser._id : undefined, action: 'CANCEL_LISTING', entityType: 'FoodListing', entityId: listing._id, reason });
    return listing;
  }

  async markExpired() {
    const now = new Date();
    const expired = await FoodListing.find({ status: 'active', $or: [{ expiryDate: { $lte: now } }, { pickupDeadline: { $lte: now } }] });
    for (const l of expired) {
      l.status = 'expired';
      l.closedQuantity += l.availableQuantity;
      l.availableQuantity = 0;
      // release reservations? if expired, close them
      const FoodAllocation = require('../models/FoodAllocation');
      const allocs = await FoodAllocation.find({ listing: l._id, status: { $in: ['reserved','ready_for_pickup'] } });
      for (const a of allocs) {
        a.status = 'expired';
        await a.save();
        l.closedQuantity += a.allocatedQuantity - a.collectedQuantity;
        l.reservedQuantity = Math.max(0, l.reservedQuantity - (a.allocatedQuantity - a.collectedQuantity));
      }
      await l.save();
    }
    return expired.length;
  }
}

module.exports = new FoodListingService();
module.exports.FoodListingService = FoodListingService;
