const FoodListing = require('../models/FoodListing');
const FoodAllocation = require('../models/FoodAllocation');
const Dispute = require('../models/Dispute');
const AuditLog = require('../models/AuditLog');
const NotificationService = require('./NotificationService');
const Organization = require('../models/Organization');
const User = require('../models/User');

class FoodSafetyService {
  async reportIncident({ reporterId, listingId, allocationId, incidentType, description, evidence }) {
    const incident = await Dispute.create({ reporter: reporterId, listing: listingId, allocation: allocationId, incidentType, description, evidence: evidence || [], status: 'open' });
    // pause affected listing
    if (listingId) {
      const listing = await FoodListing.findById(listingId);
      if (listing) {
        listing.safetyPaused = true;
        listing.safetyReason = incidentType + ': ' + description;
        listing.status = 'paused';
        await listing.save();
        // notify donor
        const donorOrg = await Organization.findById(listing.donor);
        const donorUser = await User.findById(donorOrg.user);
        if (donorUser) await NotificationService.create(donorUser._id, 'safety_incident', `Safety incident reported for ${listing.title}. Listing paused.`, incident._id, 'Dispute');
      }
    }
    if (allocationId) {
      const alloc = await FoodAllocation.findById(allocationId);
      if (alloc) {
        alloc.status = 'disputed';
        await alloc.save();
      }
    }
    await AuditLog.create({ actor: reporterId, action: 'REPORT_SAFETY_INCIDENT', entityType: 'Dispute', entityId: incident._id, reason: description });
    return incident;
  }

  async resolveIncident(incidentId, adminUser, resolution, reopen) {
    const inc = await Dispute.findById(incidentId);
    if (!inc) throw Object.assign(new Error('Incident not found'), { status: 404 });
    inc.status = 'resolved';
    inc.resolution = resolution;
    inc.resolvedBy = adminUser._id;
    await inc.save();
    if (reopen && inc.listing) {
      const listing = await FoodListing.findById(inc.listing);
      if (listing) {
        listing.safetyPaused = false;
        listing.safetyReason = '';
        listing.status = 'active';
        await listing.save();
      }
    }
    await AuditLog.create({ actor: adminUser._id, action: 'RESOLVE_INCIDENT', entityType: 'Dispute', entityId: inc._id, reason: resolution });
    return inc;
  }
}

module.exports = new FoodSafetyService();
