const express = require('express');
const router = express.Router();
const c = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, c.reportIncident);

module.exports = router;
