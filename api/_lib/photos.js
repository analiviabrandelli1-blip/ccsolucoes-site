const { put, list } = require('@vercel/blob');
const SEED = require('../../data/photos-seed.json');

const PHOTOS_KEY = 'data/photos.json';

async function readPhotos() {
  try {
    const { blobs } = await list({ prefix: PHOTOS_KEY });
    const match = blobs.find((b) => b.pathname === PHOTOS_KEY);
    if (!match) return SEED;
    // cache-bust: a URL do blob é fixa (allowOverwrite), então sem isso o CDN
    // pode servir uma versão antiga do JSON pra diferentes edges/requests.
    const r = await fetch(`${match.url}?v=${Date.now()}`, { cache: 'no-store' });
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
    // dado mutável numa URL fixa: sem isso o Blob CDN cacheia como se fosse
    // conteúdo imutável (padrão de longa duração), causando leituras inconsistentes
    // logo após cada escrita.
    cacheControlMaxAge: 0,
  });
}

module.exports = { readPhotos, writePhotos };

