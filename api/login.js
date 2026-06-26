const bcrypt = require('bcryptjs');
const { setSessionCookie } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  const { email, password } = req.body || {};
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (!email || !password || !adminEmail || !adminHash) {
    return res.status(401).json({ error: 'Email ou senha inválidos.' });
  }
  if (email.toLowerCase() !== adminEmail.toLowerCase() || !bcrypt.compareSync(password, adminHash)) {
    return res.status(401).json({ error: 'Email ou senha inválidos.' });
  }

  setSessionCookie(res);
  res.json({ ok: true });
};
