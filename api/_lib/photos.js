const { put, list } = require('@vercel/blob');
const SEED = require('../../data/photos-seed.json');

const PHOTOS_KEY = 'data/photos.json';

async function readPhotos() {
  try {
    const { blobs } = await list({ prefix: PHOTOS_KEY });
    const match = blobs.find((b) => b.pathname === PHOTOS_KEY);
    if (!match) return SEED;
    const r = await fetch(match.url, { cache: 'no-store' });
    return await r.json();
  } catch {
    return SEED;
  }
}

async function writePhotos(photos) {
  await put(PHOTOS_KEY, JSON.stringify(photos, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

module.exports = { readPhotos, writePhotos };
