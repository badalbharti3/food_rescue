const AllocationService = require('../services/AllocationService');
const Organization = require('../models/Organization');
const { ok, fail } = require('../utils/response');

async function myOrg(req) { return Organization.findOne({ user: req.user._id }); }

exports.create = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    if (!org || org.accountType !== 'receiver') return fail(res, 'Receiver org required', 403);
    if (org.verificationStatus !== 'verified') return fail(res, 'NGO not verified', 403);
    const r = await AllocationService.createRequest(req.params.listingId || req.body.listingId, org._id, req.body, req.headers['idempotency-key']);
    ok(res, r, 'Request submitted', 201);
  } catch (e) { next(e); }
};

exports.listMine = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const PickupRequest = require('../models/PickupRequest');
    const q = { ngo: org._id };
    if (req.query.status) q.status = req.query.status;
    const items = await PickupRequest.find(q).populate('listing', 'title category unit').sort({ createdAt: -1 });
    ok(res, items);
  } catch (e) { next(e); }
};

exports.listForDonor = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const FoodListing = require('../models/FoodListing');
    const PickupRequest = require('../models/PickupRequest');
    const listings = await FoodListing.find({ donor: org._id }).select('_id');
    const ids = listings.map((l) => l._id);
    const q = { listing: { $in: ids } };
    if (req.query.status) q.status = req.query.status;
    const items = await PickupRequest.find(q).populate('listing', 'title category unit').populate('ngo', 'orgName city').sort({ createdAt: -1 });
    ok(res, items);
  } catch (e) { next(e); }
};

exports.approve = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    if (!org || org.accountType !== 'donor') return fail(res, 'Donor org required', 403);
    const result = await AllocationService.approve(req.params.id, org._id, req.body.allocatedQuantity, req.user, req.body.reason);
    ok(res, result);
  } catch (e) { next(e); }
};

exports.reject = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    if (!org || org.accountType !== 'donor') return fail(res, 'Donor org required', 403);
    const result = await AllocationService.reject(req.params.id, org._id, req.user, req.body.reason);
    ok(res, result);
  } catch (e) { next(e); }
};
