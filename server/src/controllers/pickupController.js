const PickupService = require('../services/PickupService');
const Organization = require('../models/Organization');
const { ok, fail } = require('../utils/response');

async function myOrg(req) { return Organization.findOne({ user: req.user._id }); }

exports.issue = async (req, res, next) => {
  try {
    const result = await PickupService.issueVerification(req.params.allocationId, req.body.authorizedCollector);
    ok(res, result);
  } catch (e) { next(e); }
};

exports.verify = async (req, res, next) => {
  try {
    const result = await PickupService.verifyPickup(req.params.allocationId, req.body.otp, req.body.actualCollected, req.body.collectorName, req.user);
    ok(res, result);
  } catch (e) { next(e); }
};

exports.releaseRemaining = async (req, res, next) => {
  try {
    const result = await PickupService.releaseRemaining(req.params.allocationId, req.user, req.body.reason);
    ok(res, result);
  } catch (e) { next(e); }
};
