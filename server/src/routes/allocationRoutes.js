const express = require('express');
const router = express.Router();
const c = require('../controllers/allocationController');
const { authMiddleware } = require('../middleware/auth');

router.get('/donor', authMiddleware, c.listMineDonor);
router.get('/receiver', authMiddleware, c.listMineNgo);
router.post('/:id/cancel-ngo', authMiddleware, c.cancelByNgo);
router.post('/:id/cancel-donor', authMiddleware, c.cancelByDonor);

module.exports = router;
