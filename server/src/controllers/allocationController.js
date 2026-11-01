const AllocationService = require('../services/AllocationService');
const Organization = require('../models/Organization');
const { ok, fail } = require('../utils/response');

async function myOrg(req) { return Organization.findOne({ user: req.user._id }); }

exports.listMineDonor = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const result = await AllocationService.listForDonor(org._id, req.query);
    ok(res, result);
  } catch (e) { next(e); }
};

exports.listMineNgo = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const result = await AllocationService.listForNgo(org._id, req.query);
    ok(res, result);
  } catch (e) { next(e); }
};

exports.cancelByNgo = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const result = await AllocationService.cancelByNgo(req.params.id, org._id, req.body.reason);
    ok(res, result);
  } catch (e) { next(e); }
};

exports.cancelByDonor = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const result = await AllocationService.cancelByDonor(req.params.id, org._id, req.body.reason);
    ok(res, result);
  } catch (e) { next(e); }
};
