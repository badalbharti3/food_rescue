const Organization = require('../models/Organization');
const Outlet = require('../models/Outlet');
const { ok, fail } = require('../utils/response');

exports.getMyOrg = async (req, res, next) => {
  try {
    const org = await Organization.findOne({ user: req.user._id });
    ok(res, org);
  } catch (e) { next(e); }
};

exports.updateMyOrg = async (req, res, next) => {
  try {
    const org = await Organization.findOne({ user: req.user._id });
    if (!org) return fail(res, 'Org not found', 404);
    const fields = ['orgName','contactPerson','phone','address','city','pincode','serviceRadiusKm','capacity','foodPreferences','operatingHours','preferredPickupArrangements','foodCategoriesDonated','allocationDefaults'];
    for (const f of fields) if (req.body[f] !== undefined) org[f] = req.body[f];
    if (req.body.location) {
      if (Array.isArray(req.body.location.coordinates) && req.body.location.coordinates.length === 2) {
        org.location = { type: 'Point', coordinates: [Number(req.body.location.coordinates[0]), Number(req.body.location.coordinates[1])] };
      } else if (req.body.location.lng !== undefined && req.body.location.lat !== undefined) {
        org.location = { type: 'Point', coordinates: [Number(req.body.location.lng), Number(req.body.location.lat)] };
      }
    }
    await org.save();
    ok(res, org);
  } catch (e) { next(e); }
};

exports.createOutlet = async (req, res, next) => {
  try {
    const org = await Organization.findOne({ user: req.user._id });
    const outlet = await Outlet.create({ organization: org._id, ...req.body, location: req.body.location ? { type: 'Point', coordinates: [req.body.location.lng, req.body.location.lat] } : undefined });
    ok(res, outlet, 'Created', 201);
  } catch (e) { next(e); }
};

exports.listOutlets = async (req, res, next) => {
  try {
    const org = await Organization.findOne({ user: req.user._id });
    const outlets = await Outlet.find({ organization: org._id });
    ok(res, outlets);
  } catch (e) { next(e); }
};

exports.deleteOutlet = async (req, res, next) => {
  try {
    await Outlet.findByIdAndDelete(req.params.id);
    ok(res, null, 'Deleted');
  } catch (e) { next(e); }
};
