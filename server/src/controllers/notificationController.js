const NotificationService = require('../services/NotificationService');
const { ok } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const result = await NotificationService.listForUser(req.user._id, req.query);
    ok(res, result);
  } catch (e) { next(e); }
};

exports.markRead = async (req, res, next) => {
  try {
    const n = await NotificationService.markRead(req.user._id, req.params.id);
    ok(res, n);
  } catch (e) { next(e); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await NotificationService.markAllRead(req.user._id);
    ok(res, null, 'All read');
  } catch (e) { next(e); }
};

exports.unreadCount = async (req, res, next) => {
  try {
    const c = await NotificationService.unreadCount(req.user._id);
    ok(res, { count: c });
  } catch (e) { next(e); }
};
