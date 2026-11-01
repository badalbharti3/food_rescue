const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Invalid session' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
    next();
  };
}

module.exports = { authMiddleware, requireRole };
