const AdminService = require('../services/AdminService');
const VerificationService = require('../services/VerificationService');
const FoodSafetyService = require('../services/FoodSafetyService');
const { ok } = require('../utils/response');

exports.stats = async (req, res, next) => { try { ok(res, await AdminService.stats()); } catch (e) { next(e); } };
exports.analyticsByCity = async (req, res, next) => { try { ok(res, await AdminService.analyticsByCity()); } catch (e) { next(e); } };
exports.listUsers = async (req, res, next) => { try { ok(res, await AdminService.listUsers(req.query)); } catch (e) { next(e); } };
exports.listOrgs = async (req, res, next) => { try { ok(res, await AdminService.listOrgs(req.query)); } catch (e) { next(e); } };
exports.listListings = async (req, res, next) => { try { ok(res, await AdminService.listListings(req.query)); } catch (e) { next(e); } };
exports.listAllocations = async (req, res, next) => { try { ok(res, await AdminService.listAllocations(req.query)); } catch (e) { next(e); } };
exports.auditLogs = async (req, res, next) => { try { ok(res, await AdminService.auditLogs(req.query)); } catch (e) { next(e); } };

exports.opsMap = async (req, res, next) => { try { ok(res, await AdminService.opsMap()); } catch (e) { next(e); } };

exports.pendingVerifications = async (req, res, next) => { try { ok(res, await VerificationService.listPending()); } catch (e) { next(e); } };
exports.verifyOrg = async (req, res, next) => { try { ok(res, await VerificationService.verify(req.params.id, req.user, req.body.reason)); } catch (e) { next(e); } };
exports.rejectOrg = async (req, res, next) => { try { ok(res, await VerificationService.reject(req.params.id, req.user, req.body.reason)); } catch (e) { next(e); } };
exports.suspendOrg = async (req, res, next) => { try { ok(res, await VerificationService.suspend(req.params.id, req.user, req.body.reason)); } catch (e) { next(e); } };

exports.listDisputes = async (req, res, next) => {
  const Dispute = require('../models/Dispute');
  try {
    const items = await Dispute.find().populate('reporter', 'name email').populate('listing', 'title').sort({ createdAt: -1 });
    ok(res, items);
  } catch (e) { next(e); }
};
exports.resolveIncident = async (req, res, next) => { try { ok(res, await FoodSafetyService.resolveIncident(req.params.id, req.user, req.body.resolution, req.body.reopen)); } catch (e) { next(e); } };
exports.manualReallocate = async (req, res, next) => { try { ok(res, await AdminService.manualReallocate(req.params.id, req.body.newNgoId, req.user, req.body.reason)); } catch (e) { next(e); } };
exports.reportIncident = async (req, res, next) => {
  try {
    const FoodSafetyService = require('../services/FoodSafetyService');
    const result = await FoodSafetyService.reportIncident({ reporterId: req.user._id, ...req.body });
    ok(res, result, 'Reported', 201);
  } catch (e) { next(e); }
};
exports.cancelListingAdmin = async (req, res, next) => {
  try {
    const FoodListingService = require('../services/FoodListingService');
    const result = await FoodListingService.cancel(req.params.id, null, req.body.reason, req.user);
    ok(res, result);
  } catch (e) { next(e); }
};
exports.removeDonor = async (req, res, next) => {
  try { ok(res, await AdminService.removeDonor(req.params.id, req.user, req.body.reason)); } catch (e) { next(e); }
};
exports.health = async (req, res) => { res.json({ success: true, status: 'ok', time: new Date().toISOString() }); };
