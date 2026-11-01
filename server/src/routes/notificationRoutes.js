const express = require('express');
const router = express.Router();
const c = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, c.list);
router.get('/unread-count', authMiddleware, c.unreadCount);
router.post('/:id/read', authMiddleware, c.markRead);
router.post('/read-all', authMiddleware, c.markAllRead);

module.exports = router;
