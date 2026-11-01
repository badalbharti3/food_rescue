const express = require('express');
const router = express.Router();
const c = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/register/donor', authLimiter, c.registerDonor);
router.post('/register/receiver', authLimiter, c.registerReceiver);
router.post('/login', authLimiter, c.login);
router.get('/me', authMiddleware, c.me);

module.exports = router;
