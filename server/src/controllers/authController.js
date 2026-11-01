const AuthService = require('../services/AuthService');
const { ok, fail } = require('../utils/response');

exports.registerDonor = async (req, res, next) => {
  try {
    const { user, org } = await AuthService.registerDonor(req.body);
    const token = require('jsonwebtoken').sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    ok(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role }, org }, 'Registered', 201);
  } catch (e) { next(e); }
};

exports.registerReceiver = async (req, res, next) => {
  try {
    const { user, org } = await AuthService.registerReceiver(req.body);
    const token = require('jsonwebtoken').sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    ok(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role }, org }, 'Registered', 201);
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body.email, req.body.password);
    ok(res, result, 'Logged in');
  } catch (e) { next(e); }
};

exports.me = async (req, res, next) => {
  try {
    const result = await AuthService.me(req.user._id);
    ok(res, result);
  } catch (e) { next(e); }
};
