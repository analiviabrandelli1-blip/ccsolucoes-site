const { del } = require('@vercel/blob');
const { isAuthed } = require('../_lib/auth');
const { readPhotos, writePhotos } = require('../_lib/photos');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Método não permitido.' });
  if (!isAuthed(req)) return res.status(401).json({ error: 'Não autenticado.' });

  const { id } = req.query;
  const photos = await readPhotos();
  const idx = photos.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Foto não encontrada.' });

  const [removed] = photos.splice(idx, 1);
  await writePhotos(photos);

  if (removed.url.includes('blob.vercel-storage.com')) {
    try { await del(removed.url); } catch { /* já removido ou inacessível */ }
  }

  res.json({ ok: true });
};
