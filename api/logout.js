const { clearSessionCookie } = require('./_lib/auth');

module.exports = function handler(req, res) {
  clearSessionCookie(res);
  res.json({ ok: true });
};
