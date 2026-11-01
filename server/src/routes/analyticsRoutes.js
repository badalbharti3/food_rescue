const express = require('express');
const router = express.Router();
const c = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');

router.get('/overview', authMiddleware, c.overview);
router.get('/public-impact', c.publicImpact);

module.exports = router;
