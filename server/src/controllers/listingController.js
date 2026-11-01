const FoodListingService = require('../services/FoodListingService');
const Organization = require('../models/Organization');
const { ok, fail } = require('../utils/response');

async function myOrg(req) { return Organization.findOne({ user: req.user._id }); }

exports.create = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    if (!org || org.accountType !== 'donor') return fail(res, 'Donor org required', 403);
    if (org.verificationStatus !== 'verified') return fail(res, 'Organization not verified', 403);
    const listing = await FoodListingService.create(org._id, req.body, req.headers['idempotency-key']);
    ok(res, listing, 'Listing created', 201);
  } catch (e) { next(e); }
};

exports.listMine = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const result = await FoodListingService.listByDonor(org._id, req.query);
    ok(res, result);
  } catch (e) { next(e); }
};

exports.getOne = async (req, res, next) => {
  try {
    const listing = await FoodListingService.getById(req.params.id);
    ok(res, listing);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const listing = await FoodListingService.update(req.params.id, org._id, req.body, req.body.reason);
    ok(res, listing);
  } catch (e) { next(e); }
};

exports.pause = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const listing = await FoodListingService.pause(req.params.id, org._id, req.body.reason);
    ok(res, listing);
  } catch (e) { next(e); }
};

exports.cancel = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const listing = await FoodListingService.cancel(req.params.id, org._id, req.body.reason, null);
    ok(res, listing);
  } catch (e) { next(e); }
};

exports.listForNgo = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const result = await FoodListingService.listForNgo({ ngoOrg: org, filters: req.query });
    ok(res, result);
  } catch (e) { next(e); }
};

exports.nearbyForNgo = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const listings = await FoodListingService.listNearbyForNgo(org, Number(req.query.maxDistance) || 25);
    ok(res, listings);
  } catch (e) { next(e); }
};
