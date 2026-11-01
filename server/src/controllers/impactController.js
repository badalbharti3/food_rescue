const ImpactService = require('../services/ImpactService');
const Organization = require('../models/Organization');
const { ok, fail } = require('../utils/response');

// GET /impact/certificate?month=YYYY-MM  (admin may pass ?orgId=&accountType=)
exports.certificate = async (req, res, next) => {
  try {
    let orgId, accountType;
    if (req.user.role === 'admin' && req.query.orgId) {
      orgId = req.query.orgId;
      accountType = req.query.accountType === 'receiver' ? 'receiver' : 'donor';
    } else {
      const org = await Organization.findOne({ user: req.user._id });
      if (!org) return fail(res, 'Organization not found', 404);
      orgId = org._id;
      accountType = org.accountType;
    }
    const now = new Date();
    const month = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (!/^\d{4}-\d{2}$/.test(month)) return fail(res, 'month must be YYYY-MM', 400);
    const data = await ImpactService.monthlyCertificate(orgId, accountType, month);
    ok(res, data);
  } catch (e) { next(e); }
};
