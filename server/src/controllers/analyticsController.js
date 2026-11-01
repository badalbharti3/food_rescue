const AdminService = require('../services/AdminService');
const ImpactRecord = require('../models/ImpactRecord');
const FoodListing = require('../models/FoodListing');
const { ok } = require('../utils/response');

exports.overview = async (req, res, next) => {
  try {
    const stats = await AdminService.stats();
    const byCity = await AdminService.analyticsByCity();
    ok(res, { stats, byCity });
  } catch (e) { next(e); }
};

exports.publicImpact = async (req, res, next) => {
  try {
    const [listings, impact] = await Promise.all([
      FoodListing.countDocuments(),
      ImpactRecord.aggregate([{ $group: { _id: null, total: { $sum: '$actualCollectedQuantity' }, count: { $sum: 1 } } }])
    ]);
    const orgs = await (require('../models/Organization')).countDocuments({ verificationStatus: 'verified' });
    ok(res, {
      totalListings: listings,
      totalCollected: impact.length ? impact[0].total : 0,
      completedPickups: impact.length ? impact[0].count : 0,
      verifiedOrgs: orgs
    });
  } catch (e) { next(e); }
};
