const express = require('express');
const router = express.Router();
const c = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware, requireRole('admin'));

router.get('/health', c.health);
router.get('/stats', c.stats);
router.get('/analytics/city', c.analyticsByCity);
router.get('/users', c.listUsers);
router.get('/orgs', c.listOrgs);
router.get('/listings', c.listListings);
router.get('/allocations', c.listAllocations);
router.get('/audit-logs', c.auditLogs);
router.get('/ops-map', c.opsMap);
router.get('/verifications/pending', c.pendingVerifications);
router.post('/verifications/:id/verify', c.verifyOrg);
router.post('/verifications/:id/reject', c.rejectOrg);
router.post('/orgs/:id/suspend', c.suspendOrg);
router.get('/disputes', c.listDisputes);
router.post('/disputes/:id/resolve', c.resolveIncident);
router.post('/incidents', c.reportIncident);
router.post('/allocations/:id/reallocate', c.manualReallocate);
router.post('/listings/:id/cancel', c.cancelListingAdmin);
router.delete('/donors/:id', c.removeDonor);

module.exports = router;
