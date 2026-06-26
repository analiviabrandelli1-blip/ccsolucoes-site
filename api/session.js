const { isAuthed } = require('./_lib/auth');

module.exports = function handler(req, res) {
  res.json({ isAdmin: isAuthed(req) });
};
