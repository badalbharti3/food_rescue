require('dotenv').config();
const { app, connectDB } = require('./app');
const ExpiryService = require('./services/ExpiryService');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    // seed admin
    const User = require('./models/User');
    const Organization = require('./models/Organization');
    const adminEmail = process.env.ADMIN_SEED_EMAIL;
    if (adminEmail) {
      let u = await User.findOne({ email: adminEmail });
      if (!u) {
        const hash = await User.hashPassword(process.env.ADMIN_SEED_PASSWORD || 'Admin@12345');
        u = await User.create({ name: 'FreshRoute Admin', email: adminEmail, passwordHash: hash, role: 'admin', phone: '0000000000' });
        await Organization.create({ user: u._id, orgName: 'FreshRoute HQ', orgType: 'Platform Admin', accountType: 'donor', verificationStatus: 'verified', city: 'HQ', location: { type: 'Point', coordinates: [0,0] } });
        console.log('Admin seeded:', adminEmail);
      } else {
        u.role = 'admin';
        u.isActive = true;
        if (process.env.ADMIN_SEED_PASSWORD) {
          u.passwordHash = await User.hashPassword(process.env.ADMIN_SEED_PASSWORD);
        }
        await u.save();
        console.log('Admin account restored:', adminEmail);
      }
    }
    ExpiryService.start();
    require('./services/RecurringDonationService').start();
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  } catch (e) {
    console.error('Startup failed', e);
    process.exit(1);
  }
})();
