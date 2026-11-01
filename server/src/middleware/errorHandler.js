const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error('Unhandled error', { message: err.message, stack: err.stack, path: req.path });
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Internal server error' });
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

module.exports = { errorHandler, notFound };
