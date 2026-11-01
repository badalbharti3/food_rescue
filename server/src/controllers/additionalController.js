const AdditionalQuantityService = require('../services/AdditionalQuantityService');
const Organization = require('../models/Organization');
const { ok, fail } = require('../utils/response');

async function myOrg(req) { return Organization.findOne({ user: req.user._id }); }

exports.request = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const result = await AdditionalQuantityService.request(req.params.allocationId, org._id, req.body.additionalQuantity, req.body.reason);
    ok(res, result, 'Requested', 201);
  } catch (e) { next(e); }
};

exports.approve = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const result = await AdditionalQuantityService.approve(req.params.id, org._id, req.body.approvedQuantity, req.user);
    ok(res, result);
  } catch (e) { next(e); }
};

exports.reject = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const result = await AdditionalQuantityService.reject(req.params.id, org._id, req.user, req.body.reason);
    ok(res, result);
  } catch (e) { next(e); }
};

exports.listMineNgo = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const items = await AdditionalQuantityService.listForNgo(org._id);
    ok(res, items);
  } catch (e) { next(e); }
};

exports.listForDonor = async (req, res, next) => {
  try {
    const org = await myOrg(req);
    const items = await AdditionalQuantityService.listForDonor(org._id);
    ok(res, items);
  } catch (e) { next(e); }
};
