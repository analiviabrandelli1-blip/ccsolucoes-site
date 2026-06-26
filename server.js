const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcryptjs');

const ROOT = __dirname;
const IMG_DIR = path.join(ROOT, 'img', 'obras');
const DATA_DIR = path.join(ROOT, 'data');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');
const PORT = process.env.PORT || 3000;

function readPhotos() {
  return JSON.parse(fs.readFileSync(PHOTOS_FILE, 'utf8'));
}
function writePhotos(photos) {
  fs.writeFileSync(PHOTOS_FILE, JSON.stringify(photos, null, 2));
}
function readAdmin() {
  return JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'));
}

const app = express();
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 8 }
}));

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Não autenticado.' });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMG_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const name = `obra-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Formato de imagem não suportado.'));
  }
});

// ─── AUTH ───
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  const admin = readAdmin();
  if (!email || !password || email.toLowerCase() !== admin.email.toLowerCase()) {
    return res.status(401).json({ error: 'Email ou senha inválidos.' });
  }
  if (!bcrypt.compareSync(password, admin.passwordHash)) {
    return res.status(401).json({ error: 'Email ou senha inválidos.' });
  }
  req.session.isAdmin = true;
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/session', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// ─── FOTOS (público: leitura / admin: escrita) ───
app.get('/api/photos', (req, res) => {
  res.json(readPhotos());
});

app.post('/api/photos', requireAuth, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
  const photos = readPhotos();
  const entry = {
    id: path.parse(req.file.filename).name,
    file: req.file.filename,
    alt: (req.body.alt || 'Obra C&C Soluções').slice(0, 120)
  };
  photos.push(entry);
  writePhotos(photos);
  res.json({ ok: true, photo: entry });
});

app.delete('/api/photos/:id', requireAuth, (req, res) => {
  const photos = readPhotos();
  const idx = photos.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Foto não encontrada.' });
  const [removed] = photos.splice(idx, 1);
  writePhotos(photos);
  const filePath = path.join(IMG_DIR, removed.file);
  fs.unlink(filePath, () => {});
  res.json({ ok: true });
});

// ─── ARQUIVOS ESTÁTICOS ───
app.use(express.static(ROOT, { index: 'index.html' }));

app.listen(PORT, () => {
  fs.writeFileSync(path.join(DATA_DIR, 'server.pid'), String(process.pid));
  console.log(`Site no ar: http://localhost:${PORT}`);
  console.log(`Painel admin: http://localhost:${PORT}/admin.html`);
});

function cleanup() {
  try { fs.unlinkSync(path.join(DATA_DIR, 'server.pid')); } catch (e) {}
  process.exit(0);
}
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
