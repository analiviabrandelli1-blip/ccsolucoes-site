const crypto = require('crypto');
const { put } = require('@vercel/blob');
const { isAuthed } = require('../_lib/auth');
const { readPhotos, writePhotos } = require('../_lib/photos');

const ALLOWED_TYPES = /^image\/(jpeg|png|webp)$/;
const MAX_BYTES = 4 * 1024 * 1024;

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const photos = await readPhotos();
    return res.json(photos);
  }

  if (req.method === 'POST') {
    if (!isAuthed(req)) return res.status(401).json({ error: 'Não autenticado.' });

    const { filename, contentType, dataBase64, alt } = req.body || {};
    if (!dataBase64 || !contentType) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }
    if (!ALLOWED_TYPES.test(contentType)) {
      return res.status(400).json({ error: 'Formato de imagem não suportado.' });
    }

    const buffer = Buffer.from(dataBase64, 'base64');
    if (buffer.length > MAX_BYTES) {
      return res.status(400).json({ error: 'Imagem muito grande (máx. 4MB após compressão).' });
    }

    const ext = filename && filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '.jpg';
    const id = `obra-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const blob = await put(`img/obras/${id}${ext}`, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
    });

    const photos = await readPhotos();
    const entry = { id, url: blob.url, alt: (alt || 'Obra C&C Soluções').slice(0, 120) };
    photos.push(entry);
    await writePhotos(photos);

    return res.json({ ok: true, photo: entry });
  }

  res.status(405).json({ error: 'Método não permitido.' });
};
