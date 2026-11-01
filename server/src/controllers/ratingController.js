const FoodAllocation = require('../models/FoodAllocation');
const Rating = require('../models/Rating');
const Organization = require('../models/Organization');
const NotificationService = require('../services/NotificationService');
const { ok, fail } = require('../utils/response');

async function myOrg(req) {
  return Organization.findOne({ user: req.user._id });
}

// POST /ratings { allocationId, stars, comment }
exports.rate = async (req, res, next) => {
  try {
    const stars = Number(req.body.stars);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) return fail(res, 'Stars must be 1-5', 400);
    const org = await myOrg(req);
    if (!org) return fail(res, 'Organization not found', 404);

    const allocation = await FoodAllocation.findById(req.body.allocationId).populate('listing');
    if (!allocation) return fail(res, 'Allocation not found', 404);
    if (allocation.status !== 'completed') return fail(res, 'You can rate only after pickup is completed', 409);

    let direction, toOrgId;
    if (String(allocation.donor) === String(org._id)) { direction = 'donor_to_ngo'; toOrgId = allocation.ngo; }
    else if (String(allocation.ngo) === String(org._id)) { direction = 'ngo_to_donor'; toOrgId = allocation.donor; }
    else return fail(res, 'You are not part of this allocation', 403);

    const existing = await Rating.findOne({ allocation: allocation._id, direction });
    if (existing) return fail(res, 'You already rated this pickup', 409);

    const rating = await Rating.create({
      allocation: allocation._id,
      listing: allocation.listing?._id,
      direction,
      fromOrg: org._id,
      toOrg: toOrgId,
      stars,
      comment: req.body.comment
    });

    try {
      const toOrg = await Organization.findById(toOrgId);
      if (toOrg) await NotificationService.create(toOrg.user, 'rating_received', `${org.orgName} rated your pickup ${stars}/5★`, rating._id, 'Rating');
    } catch (_) {}
    ok(res, rating);
  } catch (e) {
    if (e.code === 11000) return fail(res, 409, 'You already rated this pickup');
    next(e);
  }
};

// GET /ratings/allocation/:id  → { mine, theirs }
exports.forAllocation = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    if (!org) return fail(res, 'Organization not found', 404);
    const allocation = await FoodAllocation.findById(req.params.id);
    if (!allocation) return fail(res, 'Allocation not found', 404);
    if (![String(allocation.donor), String(allocation.ngo)].includes(String(org._id))) return fail(res, 'Forbidden', 403);

    const direction = String(allocation.donor) === String(org._id) ? 'donor_to_ngo' : 'ngo_to_donor';
    const [mine, theirs] = await Promise.all([
      Rating.findOne({ allocation: allocation._id, direction }).populate('fromOrg', 'orgName'),
      Rating.findOne({ allocation: allocation._id, direction: direction === 'donor_to_ngo' ? 'ngo_to_donor' : 'donor_to_ngo' }).populate('fromOrg', 'orgName')
    ]);
    ok(res, { mine: mine || null, theirs: theirs || null });
  } catch (e) { next(e); }
};

// GET /ratings/org/:orgId → { avg, count, recent }
exports.orgSummary = async (req, res, next) => {
  try {
    const [agg, recent] = await Promise.all([
      Rating.aggregate([
        { $match: { toOrg: new (require('mongoose').Types.ObjectId)(req.params.orgId) } },
        { $group: { _id: null, avg: { $avg: '$stars' }, count: { $sum: 1 } } }
      ]),
      Rating.find({ toOrg: req.params.orgId }).sort({ createdAt: -1 }).limit(5).populate('fromOrg', 'orgName')
    ]);
    ok(res, { avg: agg.length ? Math.round(agg[0].avg * 10) / 10 : null, count: agg.length ? agg[0].count : 0, recent });
  } catch (e) { next(e); }
};
