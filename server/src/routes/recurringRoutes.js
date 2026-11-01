const express = require('express');
const router = express.Router();
const c = require('../controllers/recurringController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/mine', authMiddleware, requireRole('donor'), c.mine);
router.post('/', authMiddleware, requireRole('donor'), c.create);
router.put('/:id', authMiddleware, requireRole('donor'), c.update);
router.delete('/:id', authMiddleware, requireRole('donor'), c.remove);

module.exports = router;
