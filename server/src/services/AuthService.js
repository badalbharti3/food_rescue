const User = require('../models/User');
const Organization = require('../models/Organization');
const jwt = require('jsonwebtoken');
const { ok, fail } = require('../utils/response');
const logger = require('../utils/logger');

class AuthService {
  async registerDonor(data) {
    const exists = await User.findOne({ email: data.email });
    if (exists) throw Object.assign(new Error('Email already registered'), { status: 409 });
    const passwordHash = await User.hashPassword(data.password);
    const user = await User.create({ name: data.ownerName || data.orgName, email: data.email, passwordHash, role: 'donor', phone: data.phone });
    const org = await Organization.create({
      user: user._id,
      orgName: data.orgName,
      orgType: data.orgType,
      accountType: 'donor',
      contactPerson: data.ownerName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      pincode: data.pincode,
      location: { type: 'Point', coordinates: [data.lng || 0, data.lat || 0] },
      foodCategoriesDonated: data.foodCategories || [],
      preferredPickupArrangements: data.pickupArrangements,
      operatingHours: data.operatingHours,
      registrationDetails: data.registrationDetails,
      verificationStatus: 'pending'
    });
    return { user, org };
  }

  async registerReceiver(data) {
    const exists = await User.findOne({ email: data.email });
    if (exists) throw Object.assign(new Error('Email already registered'), { status: 409 });
    const passwordHash = await User.hashPassword(data.password);
    const user = await User.create({ name: data.representativeName || data.orgName, email: data.email, passwordHash, role: 'receiver', phone: data.phone });
    const org = await Organization.create({
      user: user._id,
      orgName: data.orgName,
      orgType: data.orgType,
      accountType: 'receiver',
      contactPerson: data.representativeName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      pincode: data.pincode,
      location: { type: 'Point', coordinates: [data.lng || 0, data.lat || 0] },
      serviceRadiusKm: data.maxPickupDistance || 10,
      capacity: { storageKg: data.storageCapacity || 0, dailyReceiveKg: data.dailyCapacity || 0 },
      foodPreferences: data.foodPreferences || [],
      operatingHours: data.operatingHours,
      registrationDetails: data.registrationNumber,
      documents: data.documents || [],
      vehicleAvailable: data.vehicleAvailable || false,
      verificationStatus: 'pending'
    });
    return { user, org };
  }

  async login(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    const ok = await user.comparePassword(password);
    if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    if (!user.isActive) throw Object.assign(new Error('Account suspended'), { status: 403 });
    user.lastLoginAt = new Date();
    await user.save();
    const org = await Organization.findOne({ user: user._id });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role }, org };
  }

  async me(userId) {
    const user = await User.findById(userId).select('-passwordHash');
    const org = await Organization.findOne({ user: userId });
    return { user, org };
  }
}

module.exports = new AuthService();
