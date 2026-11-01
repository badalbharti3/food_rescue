const express = require('express');
const router = express.Router();
const c = require('../controllers/additionalController');
const { authMiddleware } = require('../middleware/auth');

router.post('/:allocationId', authMiddleware, c.request);
router.post('/:id/approve', authMiddleware, c.approve);
router.post('/:id/reject', authMiddleware, c.reject);
router.get('/mine/ngo', authMiddleware, c.listMineNgo);
router.get('/mine/donor', authMiddleware, c.listForDonor);

module.exports = router;
