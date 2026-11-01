function ok(res, data = null, message = 'OK', status = 200) {
  return res.status(status).json({ success: true, message, data });
}
function fail(res, message = 'Error', status = 400, errors) {
  return res.status(status).json({ success: false, message, errors });
}
module.exports = { ok, fail };
