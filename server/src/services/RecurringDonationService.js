const cron = require('node-cron');
const RecurringDonation = require('../models/RecurringDonation');
const FoodListingService = require('./FoodListingService');
const NotificationService = require('./NotificationService');
const User = require('../models/User');

class RecurringDonationService {
  start() {
    cron.schedule('*/20 * * * *', async () => {
      try {
        const recs = await RecurringDonation.find({ active: true }).populate('donor');
        for (const r of recs) {
          try {
            if (this.isDue(r)) await this.run(r);
          } catch (e) {
            console.error(`Recurring run failed for ${r._id}:`, e.message);
          }
        }
      } catch (e) {
        console.error('Recurring job error', e.message);
      }
    });
    console.log('Recurring donations cron started');
  }

  // next weekly occurrence strictly after lastRunAt (or createdAt); due when now >= it
  isDue(r) {
    const base = r.lastRunAt || r.createdAt || new Date(0);
    if (Date.now() - base.getTime() < 60 * 60 * 1000) return false; // cooldown
    let d = new Date(base);
    d.setHours(r.hour, 0, 0, 0);
    d.setDate(d.getDate() + ((r.dayOfWeek - d.getDay() + 7) % 7));
    if (d <= base) d.setDate(d.getDate() + 7);
    return new Date() >= d;
  }

  async run(r) {
    const now = new Date();
    const expiry = new Date(now.getTime() + r.expiryHours * 3600000);
    const deadline = new Date(expiry.getTime() - Math.max(30 * 60000, r.expiryHours * 360000));
    const dateKey = now.toISOString().slice(0, 10);
    const key = `recurring:${r._id}:${dateKey}`;
    const listing = await FoodListingService.create(
      r.donor._id,
      {
        title: r.title,
        description: r.description,
        category: r.category,
        totalQuantity: r.totalQuantity,
        unit: r.unit,
        pickupAddress: r.pickupAddress,
        city: r.city,
        lng: r.lng,
        lat: r.lat,
        expiryDate: expiry,
        pickupDeadline: deadline
      },
      key
    );
    if (listing && listing.idempotencyKey === key) {
      r.lastRunAt = now;
      r.createdCount += 1;
      r.lastListing = listing._id;
      await r.save();
      try {
        if (r.donor) {
          const UserRef = require('../models/User');
          const donorUser = await UserRef.findById(r.donor.user);
          if (donorUser) await NotificationService.create(donorUser._id, 'recurring_created', `Recurring donation generated: "${r.title}" (${r.totalQuantity} ${r.unit}). It expires at ${expiry.toLocaleTimeString()}.`, listing._id, 'FoodListing');
        }
      } catch (_) {}
      console.log(`Recurring listing created from schedule ${r._id}: ${r.title}`);
    }
    return listing;
  }
}

module.exports = new RecurringDonationService();
