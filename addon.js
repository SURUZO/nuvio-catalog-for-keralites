const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const { CATALOGS } = require('./lib/catalogs');
const { STATIC_CATALOGS } = require('./lib/static');
const { fetchCatalog, fetchMeta, tmdbGet } = require('./lib/tmdb');

const ADDON_ID = 'com.suruzo.catalog';
const ADDON_VERSION = '1.0.0';

function getApiKey(args) {
  // Accepts v3 API Key (32 chars) OR v4 Read Access Token (eyJ... JWT).
  // Priority: 1) per-user config 2) env 3) empty (static fallback)
  if (args?.config?.tmdbReadToken) return String(args.config.tmdbReadToken).trim();
  if (args?.config?.tmdbApiKey) return String(args.config.tmdbApiKey).trim();
  if (process.env.TMDB_READ_TOKEN) return String(process.env.TMDB_READ_TOKEN).trim();
  if (process.env.TMDB_API_KEY) return String(process.env.TMDB_API_KEY).trim();
  return '';
}

function paginate(metas, skip) {
  const s = parseInt(skip, 10);
  if (!isNaN(s) && s > 0) return metas.slice(s);
  return metas;
}

function buildManifest() {
  return {
    id: ADDON_ID,
    version: ADDON_VERSION,
    name: 'Suruzo Catalog',
    description: 'Suruzo Catalog: fresh Malayalam trending/new + Anime + Hindi + English + time-based trending (TMDB live, curated fallback).',
    logo: 'https://raw.githubusercontent.com/Stremio/stremio-web/development/assets/images/stremio_symbol.png',
    resources: ['catalog', 'meta'],
    types: ['movie', 'series'],
    idPrefixes: ['tt', 'tmdb'],
    catalogs: CATALOGS.map(c => ({
      type: c.type,
      id: c.key,
      name: c.name,
      extra: [{ name: 'search' }, { name: 'skip' }]
    })),
    config: [
      { key: 'tmdbApiKey', type: 'text', title: 'TMDB API Key (v3, 32 chars) — OR use Read Token below' },
      { key: 'tmdbReadToken', type: 'text', title: 'TMDB Read Access Token (v4, starts with eyJ... — recommended)' }
    ],
    behaviorHints: { configurable: true }
  };
}

const builder = new addonBuilder(buildManifest());

builder.defineCatalogHandler(async (args) => {
  const { type, id, extra = {} } = args;
  const def = CATALOGS.find(c => c.key === id && c.type === type);
  if (!def) return { metas: [] };

  const apiKey = getApiKey(args);
  const skip = extra.skip ? parseInt(extra.skip, 10) || 0 : 0;
  const search = (extra.search || '').trim();

  try {
    if (apiKey) {
      let metas = [];

      if (search) {
        // Global search across movies + tv, then filter to catalog type
        const data = await tmdbGet('/search/multi', apiKey, { query: search, include_adult: 'false', page: '1' }, 10 * 60 * 1000);
        const results = (data.results || []).filter(r => r.media_type === 'movie' || r.media_type === 'tv');
        const filtered = results.filter(r =>
          type === 'movie' ? r.media_type === 'movie' : r.media_type === 'tv'
        ).slice(0, 30);
        metas = filtered.map(r => {
          const title = r.title || r.name || 'Unknown';
          const date = r.release_date || r.first_air_date || '';
          return {
            id: `tmdb:${type}:${r.id}`,
            type,
            name: title,
            poster: r.poster_path ? 'https://image.tmdb.org/t/p/w500' + r.poster_path : undefined,
            releaseInfo: date ? date.slice(0, 4) : undefined,
            description: r.overview || undefined,
            imdbRating: r.vote_average ? String(Number(r.vote_average).toFixed(1)) : undefined
          };
        });
        // try resolve imdb for top hits (bounded: TV hides slow catalogs)
        await Promise.race([
          Promise.all(metas.slice(0, 5).map(async (m) => {
            try {
              const tmdbId = m.id.split(':').pop();
              const kind = type === 'series' ? 'tv' : 'movie';
              const ext = await tmdbGet(`/${kind}/${tmdbId}/external_ids`, apiKey, {}, 7 * 24 * 3600 * 1000);
              if (ext.imdb_id && ext.imdb_id.startsWith('tt')) m.id = ext.imdb_id;
            } catch {}
          })),
          new Promise(r => setTimeout(r, 3500))
        ]);
      } else {
        const spec = def.tmdb();
        const page = skip >= 20 ? Math.floor(skip / 20) + 1 : 1;
        const data = await fetchCatalog({ apiKey, tmdbPath: spec.path, params: { ...spec.params, page: String(page) }, type });
        metas = data;
        // Freshness guard: Malayalam trending/new must be recent, drop stale years
        const curYear = new Date().getFullYear();
        if (id === 'ml-trending') {
          const fresh = metas.filter(m => !m.releaseInfo || parseInt(m.releaseInfo, 10) >= curYear - 2);
          if (fresh.length >= 5) metas = fresh;
        }
        if (id === 'ml-new') {
          const fresh = metas.filter(m => !m.releaseInfo || parseInt(m.releaseInfo, 10) >= curYear - 1);
          if (fresh.length >= 3) metas = fresh;
          metas.sort((a, b) => (b.releaseInfo || '').localeCompare(a.releaseInfo || ''));
        }
        if (id === 'anime-trending') {
          // Keep anime-trending mostly anime: prefer animation entries when available
          const animeish = metas.filter(m => (m.genres || []).some(g => /animation|anime/i.test(g)));
          if (animeish.length >= 5) metas = animeish;
        }
      }

      // cleanup undefined + paginate remainder
      metas = metas.filter(m => m && m.id && m.name).map(m => {
        const o = {};
        for (const [k, v] of Object.entries(m)) if (v !== undefined) o[k] = v;
        return o;
      });
      if (!search && skip % 20 !== 0) metas = metas.slice(skip % 20);
      return { metas, cacheMaxAge: 3600 };
    }
  } catch (e) {
    console.error('TMDB catalog failed, falling back to static:', id, e.message);
  }

  // Static fallback (works with no key)
  let metas = STATIC_CATALOGS[id] || [];
  metas = metas.filter(m => m.type === type);
  if (search) {
    const q = search.toLowerCase();
    metas = metas.filter(m => m.name.toLowerCase().includes(q));
  }
  metas = paginate(metas, skip);
  return { metas, cacheMaxAge: 86400 };
});

builder.defineMetaHandler(async (args) => {
  const { type, id } = args;
  // Only handle our tmdb: ids. tt* ids are resolved by Cinemeta / other meta addons.
  const m = /^tmdb:(movie|series):(\d+)(?::(\d+):(\d+))?$/.exec(id);
  if (!m) return { meta: null };
  const stremioType = m[1] === 'movie' ? 'movie' : 'series';
  if (stremioType !== type) return { meta: null };
  const tmdbId = m[2];
  const apiKey = getApiKey(args);
  if (!apiKey) return { meta: null };
  try {
    const meta = await fetchMeta(apiKey, stremioType, tmdbId);
    return { meta, cacheMaxAge: 6 * 3600 };
  } catch (e) {
    console.error('TMDB meta failed:', id, e.message);
    return { meta: null };
  }
});

const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });
console.log(`Suruzo Catalog addon running at http://127.0.0.1:${PORT}/manifest.json`);
console.log('Install in Nuvio/Stremio with that URL. Set TMDB_API_KEY or TMDB_READ_TOKEN env, or configure on landing page.');
