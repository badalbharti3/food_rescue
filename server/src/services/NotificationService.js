const Notification = require('../models/Notification');

class NotificationService {
  async create(recipientId, type, message, refId, refType, idempotencyKey) {
    try {
      if (idempotencyKey) {
        const exists = await Notification.findOne({ idempotencyKey });
        if (exists) return exists;
      }
      return await Notification.create({ recipient: recipientId, type, message, referenceId: refId, referenceType: refType, idempotencyKey });
    } catch (e) {
      console.error('Notification create failed', e.message);
      return null;
    }
  }

  async listForUser(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Notification.find({ recipient: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments({ recipient: userId })
    ]);
    return { items, total, page, limit };
  }

  async markRead(userId, id) {
    const n = await Notification.findOneAndUpdate({ _id: id, recipient: userId }, { readAt: new Date() }, { new: true });
    return n;
  }

  async markAllRead(userId) {
    await Notification.updateMany({ recipient: userId, readAt: null }, { readAt: new Date() });
  }

  async unreadCount(userId) {
    return Notification.countDocuments({ recipient: userId, readAt: null });
  }
}

module.exports = new NotificationService();
