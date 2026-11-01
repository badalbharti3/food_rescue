const express = require('express');
const router = express.Router();
const c = require('../controllers/ratingController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.post('/', authMiddleware, requireRole('donor', 'receiver'), c.rate);
router.get('/allocation/:id', authMiddleware, requireRole('donor', 'receiver'), c.forAllocation);
router.get('/org/:orgId', authMiddleware, c.orgSummary);

module.exports = router;
