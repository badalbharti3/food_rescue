const express = require('express');
const router = express.Router();
const c = require('../controllers/orgController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/me', c.getMyOrg);
router.put('/me', c.updateMyOrg);
router.get('/outlets', c.listOutlets);
router.post('/outlets', c.createOutlet);
router.delete('/outlets/:id', c.deleteOutlet);

module.exports = router;
