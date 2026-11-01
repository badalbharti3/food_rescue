function log(level, msg, meta) {
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${msg}` + (meta ? ' ' + JSON.stringify(meta) : '');
  console.log(line);
}
module.exports = {
  info: (m, meta) => log('info', m, meta),
  warn: (m, meta) => log('warn', m, meta),
  error: (m, meta) => log('error', m, meta)
};
