const cron = require('node-cron');
const FoodListingService = require('./FoodListingService');
const FoodAllocation = require('../models/FoodAllocation');
const FoodListing = require('../models/FoodListing');
const NotificationService = require('./NotificationService');
const Organization = require('../models/Organization');
const User = require('../models/User');

class ExpiryService {
  start() {
    // run every minute in dev; every 5 min prod
    cron.schedule('*/2 * * * *', async () => {
      try {
        const n = await FoodListingService.markExpired();
        // Auto-expire party/wedding/banquet listings older than 3 days (Indian wedding/party duration)
        const Organization = require('../models/Organization');
        const partyOrgs = await Organization.find({ orgType: { $in: ['Banquet Hall', 'Party Hall', 'Wedding Venue'] } }).select('_id');
        const partyOrgIds = partyOrgs.map((o) => o._id);
        if (partyOrgIds.length) {
          const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
          const oldPartyListings = await FoodListing.find({ donor: { $in: partyOrgIds }, status: 'active', createdAt: { $lte: cutoff } });
          for (const l of oldPartyListings) {
            l.status = 'expired';
            l.closedQuantity += l.availableQuantity + l.reservedQuantity;
            l.availableQuantity = 0;
            l.reservedQuantity = 0;
            await l.save();
            const donorOrg = await Organization.findById(l.donor);
            const User = require('../models/User');
            const donorUser = await User.findById(donorOrg.user);
            if (donorUser) await NotificationService.create(donorUser._id, 'listing_expired', `Your listing ${l.title} expired automatically after 3 days.`, l._id, 'FoodListing');
          }
        }
        // release expired reservations
        const now = new Date();
        const expiredAllocs = await FoodAllocation.find({ status: { $in: ['reserved','ready_for_pickup'] }, reservationExpiresAt: { $lte: now } });
        for (const a of expiredAllocs) {
          a.status = 'expired';
          await a.save();
          const listing = await FoodListing.findById(a.listing);
          if (listing) {
            const remaining = a.allocatedQuantity - a.collectedQuantity;
            listing.reservedQuantity = Math.max(0, listing.reservedQuantity - remaining);
            listing.closedQuantity += remaining;
            await listing.save();
          }
          const ngo = await Organization.findById(a.ngo);
          const ngoUser = await User.findById(ngo.user);
          if (ngoUser) await NotificationService.create(ngoUser._id, 'reservation_expired', `Reservation expired for allocation.`, a._id, 'FoodAllocation');
        }
        // no-show handling: allocations past pickupDeadline + grace
        const grace = Number(process.env.GRACE_PERIOD_MINUTES) || 15;
        const cutoff = new Date(Date.now() - grace * 60000);
        const noShows = await FoodAllocation.find({ status: { $in: ['reserved','ready_for_pickup'] }, /* pickupDeadline via listing */ });
        // We'll handle no-show in separate job scanning listings
        if (n > 0) console.log('Expired listings:', n);
      } catch (e) {
        console.error('Expiry job error', e.message);
      }
    });
    console.log('Expiry cron started');
  }
}

module.exports = new ExpiryService();
