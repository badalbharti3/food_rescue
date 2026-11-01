const express = require('express');
const router = express.Router();
const c = require('../controllers/pickupController');
const { authMiddleware } = require('../middleware/auth');

router.post('/:allocationId/issue', authMiddleware, c.issue);
router.post('/:allocationId/verify', authMiddleware, c.verify);
router.post('/:allocationId/release', authMiddleware, c.releaseRemaining);

module.exports = router;
