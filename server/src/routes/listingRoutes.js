const express = require('express');
const router = express.Router();
const c = require('../controllers/listingController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// NGO discovery (must be before :id)
router.get('/for-ngo', authMiddleware, requireRole('receiver'), c.listForNgo);
router.get('/nearby', authMiddleware, requireRole('receiver'), c.nearbyForNgo);

router.post('/', authMiddleware, requireRole('donor'), c.create);
router.get('/mine', authMiddleware, requireRole('donor'), c.listMine);
router.get('/:id', authMiddleware, c.getOne);
router.put('/:id', authMiddleware, requireRole('donor'), c.update);
router.post('/:id/pause', authMiddleware, requireRole('donor'), c.pause);
router.post('/:id/cancel', authMiddleware, requireRole('donor'), c.cancel);

module.exports = router;
