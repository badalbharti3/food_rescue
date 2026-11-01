const RecurringDonation = require('../models/RecurringDonation');
const Organization = require('../models/Organization');
const FoodListing = require('../models/FoodListing');
const { ok, fail } = require('../utils/response');

async function myDonorOrg(req) {
  return Organization.findOne({ user: req.user._id, accountType: 'donor' });
}

const editable = ['outlet', 'title', 'description', 'category', 'totalQuantity', 'unit', 'pickupAddress', 'city', 'lng', 'lat', 'expiryHours', 'dayOfWeek', 'hour', 'active'];

exports.mine = async (req, res, next) => {
  try {
    const org = await myDonorOrg(req);
    if (!org) return fail(res, 'Organization not found', 404);
    const items = await RecurringDonation.find({ donor: org._id }).sort({ createdAt: -1 }).populate('outlet', 'name').populate('lastListing', 'status pickupDeadline');
    ok(res, items);
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const org = await myDonorOrg(req);
    if (!org) return fail(res, 'Organization not found', 404);
    if (org.verificationStatus !== 'verified') return fail(res, 'Your organization must be verified to schedule recurring donations', 403);
    const day = Number(req.body.dayOfWeek);
    const qty = Number(req.body.totalQuantity);
    const hour = Number(req.body.hour ?? 18);
    if (!Number.isInteger(day) || day < 0 || day > 6) return fail(res, 'dayOfWeek must be 0 (Sun) to 6 (Sat)', 400);
    if (Number.isNaN(qty) || qty <= 0) return fail(res, 'Invalid quantity', 400);
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) return fail(res, 'hour must be 0-23', 400);
    const rec = await RecurringDonation.create({
      donor: org._id,
      outlet: req.body.outletId || undefined,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      totalQuantity: qty,
      unit: req.body.unit || 'packets',
      pickupAddress: req.body.pickupAddress || org.address,
      city: req.body.city || org.city,
      lng: req.body.lng ?? org.location?.coordinates?.[0],
      lat: req.body.lat ?? org.location?.coordinates?.[1],
      expiryHours: Number(req.body.expiryHours) || 12,
      dayOfWeek: day,
      hour,
      active: req.body.active ?? true
    });
    ok(res, rec, 'Recurring donation scheduled', 201);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const org = await myDonorOrg(req);
    if (!org) return fail(res, 'Organization not found', 404);
    const rec = await RecurringDonation.findOne({ _id: req.params.id, donor: org._id });
    if (!rec) return fail(res, 'Recurring donation not found', 404);
    for (const f of editable) {
      if (req.body[f] !== undefined) rec[f] = req.body[f];
    }
    if (req.body.quantity !== undefined) rec.totalQuantity = req.body.quantity;
    await rec.save();
    ok(res, rec, 'Updated');
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const org = await myDonorOrg(req);
    if (!org) return fail(res, 'Organization not found', 404);
    const rec = await RecurringDonation.deleteOne({ _id: req.params.id, donor: org._id });
    if (!rec.deletedCount) return fail(res, 'Recurring donation not found', 404);
    ok(res, { deleted: true });
  } catch (e) { next(e); }
};
