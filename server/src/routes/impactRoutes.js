const express = require('express');
const router = express.Router();
const c = require('../controllers/impactController');
const { authMiddleware } = require('../middleware/auth');

router.get('/certificate', authMiddleware, c.certificate);

module.exports = router;
