const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const orgRoutes = require('./routes/orgRoutes');
const listingRoutes = require('./routes/listingRoutes');
const requestRoutes = require('./routes/requestRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const additionalRoutes = require('./routes/additionalRoutes');
const pickupRoutes = require('./routes/pickupRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const impactRoutes = require('./routes/impactRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const recurringRoutes = require('./routes/recurringRoutes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api', globalLimiter);

app.get('/api/v1/health', (req, res) => res.json({ success: true, status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organizations', orgRoutes);
app.use('/api/v1/food-listings', listingRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/allocations', allocationRoutes);
app.use('/api/v1/additional-quantity', additionalRoutes);
app.use('/api/v1/pickups', pickupRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/disputes', disputeRoutes);
app.use('/api/v1/impact', impactRoutes);
app.use('/api/v1/ratings', ratingRoutes);
app.use('/api/v1/recurring', recurringRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = { app, connectDB };
