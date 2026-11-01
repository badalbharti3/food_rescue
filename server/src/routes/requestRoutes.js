const express = require('express');
const router = express.Router();
const c = require('../controllers/requestController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.post('/', authMiddleware, requireRole('receiver'), c.create);
router.get('/mine', authMiddleware, requireRole('receiver'), c.listMine);
router.get('/donor', authMiddleware, requireRole('donor'), c.listForDonor);
router.post('/:id/approve', authMiddleware, requireRole('donor'), c.approve);
router.post('/:id/reject', authMiddleware, requireRole('donor'), c.reject);

module.exports = router;
