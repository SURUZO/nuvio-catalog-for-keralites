# Malayali Catalog — Nuvio / Stremio Addon

Perfect catalog for a Malayali viewer:
- **Malayalam first**: Trending Now, New Releases (last 18 months), Top Rated, Series
- **Anime**: Trending, Top Japan animation, Anime Movies
- **Hindi**: Bollywood trending
- **English**: Hollywood trending
- **Time-based trending**: Today (`/trending/movie/day`), This Week (`/trending/all/week`), Series trending

Works in **Nuvio and Stremio** (same addon protocol).

## How it works

- **Live mode** (with TMDB key): `discover` + `trending` endpoints with `with_original_language=ml/hi/ja/en`, mapped to Stremio metas. IMDb IDs resolved via `external_ids` so streams (Torrentio etc.) work. Falls back to `tmdb:movie:id` with built-in meta handler.
- **Static fallback** (no key): curated Malayalam / anime / Hindi / English lists with real `tt` IDs, so addon installs and shows something immediately.

## Setup

1. Get free key: https://www.themoviedb.org/settings/api
2. Install deps and run:

```powershell
npm install
$env:TMDB_API_KEY="your_key"
npm start
```

3. Open `http://127.0.0.1:7000/manifest.json`
4. In Nuvio / Stremio → Addons → Install via URL → paste manifest URL.
   - Or with key in URL: `http://127.0.0.1:7000/<tmdbApiKey>/manifest.json` — actually config is done on the landing page: open `http://127.0.0.1:7000/` and enter key, then Install.

> For phones / other devices use your LAN IP or deploy (BeamUp / Render / Railway) with HTTPS.

## Catalogs

| id | name | type |
|----|------|------|
| ml-trending | Malayalam • Trending Now | movie |
| ml-new | Malayalam • New Releases | movie |
| ml-top | Malayalam • Top Rated | movie |
| ml-series | Malayalam • Series | series |
| anime-trending | Anime • Trending | series |
| anime-top | Anime • Top (Japan) | series |
| anime-movies | Anime • Movies | movie |
| hindi-trending | Hindi • Trending | movie |
| english-trending | English • Hollywood Trending | movie |
| trending-day | Trending • Today | movie |
| trending-week | Trending • This Week | movie |
| trending-series | Trending • Series | series |

All support `search` + `skip` (pagination).

## Test

```powershell
# manifest
Invoke-RestMethod http://127.0.0.1:7000/manifest.json | Select-Object -ExpandProperty catalogs
# catalog (static fallback works without key)
Invoke-RestMethod http://127.0.0.1:7000/catalog/movie/ml-trending.json | Select-Object -First 1
```

## Deploy

Any Node host. Set `TMDB_API_KEY` env or let users enter their own key in addon config.
