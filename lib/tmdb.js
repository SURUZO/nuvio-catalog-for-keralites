// Tiny TMDB client with in-memory cache. No deps, uses global fetch (Node 18+).
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/w500';
const IMG_ORIG = 'https://image.tmdb.org/t/p/original';

const cache = new Map(); // key -> { exp, data }
function cacheGet(key) {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() > e.exp) { cache.delete(key); return null; }
  return e.data;
}
function cacheSet(key, data, ttlMs) {
  if (cache.size > 500) cache.clear();
  cache.set(key, { exp: Date.now() + ttlMs, data });
}

function isBearerToken(key) {
  if (!key) return false;
  // v4 Read Access Token is a long JWT (eyJ...), v3 API key is 32 hex chars
  return key.startsWith('eyJ') || key.length > 100;
}

async function tmdbGet(path, key, params = {}, ttlMs = 60 * 60 * 1000) {
  const useBearer = isBearerToken(key);
  const qs = new URLSearchParams({ language: 'en-US', ...params });
  if (!useBearer) qs.set('api_key', key);
  const url = `${TMDB_BASE}${path}?${qs}`;
  const cacheKey = (useBearer ? 'bearer:' : 'key:') + url;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;
  const headers = { accept: 'application/json' };
  if (useBearer) headers.Authorization = `Bearer ${key}`;
  // TV clients time out fast (~10s) + Render free cold-starts are slow,
  // so fail fast per-request instead of hanging the whole catalog.
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 7000);
  try {
    const res = await fetch(url, { headers, signal: ctrl.signal });
    if (!res.ok) throw new Error(`TMDB ${res.status} ${path}`);
    const data = await res.json();
    cacheSet(cacheKey, data, ttlMs);
    return data;
  } finally {
    clearTimeout(t);
  }
}

const genreCache = { movie: null, tv: null };
async function genreMap(apiKey, mediaType) {
  const kind = mediaType === 'tv' ? 'tv' : 'movie';
  if (genreCache[kind]) return genreCache[kind];
  try {
    const data = await tmdbGet(`/genre/${kind}/list`, apiKey, {}, 7 * 24 * 3600 * 1000);
    const m = {};
    for (const g of (data.genres || [])) m[g.id] = g.name;
    genreCache[kind] = m;
    return m;
  } catch { return {}; }
}

// Resolve TMDB movie/tv -> IMDb id (cached). Returns null if not found.
async function externalImdb(apiKey, mediaType, tmdbId) {
  const kind = mediaType === 'tv' ? 'tv' : 'movie';
  try {
    const data = await tmdbGet(`/${kind}/${tmdbId}/external_ids`, apiKey, {}, 7 * 24 * 3600 * 1000);
    return data.imdb_id || null;
  } catch { return null; }
}

function toPreview(item, stremioType, genres) {
  const isTv = stremioType === 'series' || item.media_type === 'tv' || item.first_air_date;
  const type = stremioType || (isTv ? 'series' : 'movie');
  const title = item.title || item.name || item.original_title || 'Unknown';
  const date = item.release_date || item.first_air_date || '';
  const year = date ? date.slice(0, 4) : undefined;
  const gnames = (item.genre_ids || []).map(id => genres[id]).filter(Boolean).slice(0, 3);
  return {
    _tmdbId: item.id,
    _media: item.media_type === 'movie' || item.media_type === 'tv' ? item.media_type : (type === 'series' ? 'tv' : 'movie'),
    id: `tmdb:${type}:${item.id}`, // temp, replaced with tt when resolved
    type,
    name: title,
    poster: item.poster_path ? IMG + item.poster_path : undefined,
    backdrop: item.backdrop_path ? IMG_ORIG + item.backdrop_path : undefined,
    genres: gnames.length ? gnames : undefined,
    releaseInfo: year,
    description: item.overview || undefined,
    imdbRating: item.vote_average ? String(Number(item.vote_average).toFixed(1)) : undefined
  };
}

// Enrich previews with real IMDb ids (parallel, best-effort).
// Keeps tmdb: id as fallback so details page still works via our meta handler.
// TV-safe: bounded by a short overall timeout so a slow TMDB never
// makes the whole catalog time out (TV hides slow catalogs, phone retries).
async function withImdbIds(apiKey, previews, limit = 8, timeoutMs = 3500) {
  const slice = previews.slice(0, limit);
  const work = Promise.all(slice.map(async (p) => {
    const imdb = await externalImdb(apiKey, p._media, p._tmdbId);
    if (imdb && imdb.startsWith('tt')) {
      p.id = imdb;
    }
    delete p._tmdbId;
    delete p._media;
  }));
  // Don't let enrichment block the catalog: race against timeout.
  await Promise.race([work, new Promise(r => setTimeout(r, timeoutMs))]);
  // cleanup rest (and any slice items if we timed out early)
  for (const p of previews) { delete p._tmdbId; delete p._media; }
  return previews;
}

async function fetchCatalog({ apiKey, tmdbPath, params = {}, type }) {
  const kind = type === 'series' ? 'tv' : 'movie';
  const gmap = await genreMap(apiKey, kind);
  const data = await tmdbGet(tmdbPath, apiKey, params, 30 * 60 * 1000);
  const results = (data.results || []).filter(r => r.poster_path || r.backdrop_path);
  const previews = results.map(r => toPreview(r, type, gmap));
  await withImdbIds(apiKey, previews, 8, 3500);
  // strip undefined
  return previews.map(p => {
    const o = {};
    for (const [k, v] of Object.entries(p)) if (v !== undefined) o[k] = v;
    return o;
  });
}

async function fetchMeta(apiKey, stremioType, tmdbId) {
  const kind = stremioType === 'series' ? 'tv' : 'movie';
  const gmap = await genreMap(apiKey, kind);
  const data = await tmdbGet(`/${kind}/${tmdbId}`, apiKey, { append_to_response: 'credits' }, 6 * 3600 * 1000);
  const title = data.title || data.name || 'Unknown';
  const date = data.release_date || data.first_air_date || '';
  const year = date ? date.slice(0, 4) : undefined;
  const genres = (data.genres || []).map(g => g.name);
  const cast = (data.credits?.cast || []).slice(0, 8).map(c => c.name);
  const director = (data.credits?.crew || []).find(c => c.job === 'Director')?.name;
  // videos for series
  let videos = [];
  if (kind === 'tv') {
    const seasons = (data.seasons || []).filter(s => s.season_number > 0);
    // Expand first 3 seasons lazily: 1 episode entry per season to keep it light
    videos = seasons.slice(0, 5).map(s => ({
      id: `tmdb:series:${tmdbId}:${s.season_number}:1`,
      title: `S${s.season_number} E1`,
      season: s.season_number,
      episode: 1,
      overview: s.overview || undefined,
      thumbnail: s.poster_path ? IMG + s.poster_path : undefined,
      released: s.air_date ? new Date(s.air_date).toISOString() : undefined
    }));
  } else {
    videos = [{
      id: `tmdb:movie:${tmdbId}`,
      title,
      released: date ? new Date(date).toISOString() : undefined
    }];
  }
  return {
    id: `tmdb:${stremioType}:${tmdbId}`,
    type: stremioType,
    name: title,
    poster: data.poster_path ? IMG + data.poster_path : undefined,
    backdrop: data.backdrop_path ? IMG_ORIG + data.backdrop_path : undefined,
    genres: genres.length ? genres : undefined,
    releaseInfo: year,
    description: data.overview || undefined,
    imdbRating: data.vote_average ? String(Number(data.vote_average).toFixed(1)) : undefined,
    cast: cast.length ? cast : undefined,
    director: director ? [director] : undefined,
    runtime: data.runtime ? `${data.runtime} min` : undefined,
    language: data.original_language || undefined,
    country: (data.origin_country || []).join(', ') || undefined,
    videos
  };
}

module.exports = { fetchCatalog, fetchMeta, tmdbGet };
