// Catalog definitions: id -> { name, type, tmdb() }.
// Malayalam catalogs are strictly FRESH (last 12-24 months) + quality gates,
// so trending/new never show old random entries.

function isoMonthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

const CATALOGS = [
  {
    key: 'ml-trending',
    name: 'Malayalam • Trending Now',
    type: 'movie',
    tmdb: () => ({
      path: '/discover/movie',
      params: {
        with_original_language: 'ml',
        sort_by: 'popularity.desc',
        'primary_release_date.gte': isoMonthsAgo(24),
        'vote_count.gte': 20,
        'vote_average.gte': 5,
        include_adult: 'false'
      }
    })
  },
  {
    key: 'ml-new',
    name: 'Malayalam • New Releases',
    type: 'movie',
    tmdb: () => ({
      path: '/discover/movie',
      params: {
        with_original_language: 'ml',
        sort_by: 'primary_release_date.desc',
        'primary_release_date.gte': isoMonthsAgo(12),
        'vote_count.gte': 5,
        include_adult: 'false'
      }
    })
  },
  {
    key: 'ml-top',
    name: 'Malayalam • Top Rated',
    type: 'movie',
    tmdb: () => ({
      path: '/discover/movie',
      params: {
        with_original_language: 'ml',
        sort_by: 'vote_average.desc',
        'vote_count.gte': 100,
        'vote_average.gte': 7,
        include_adult: 'false'
      }
    })
  },
  {
    key: 'ml-series',
    name: 'Malayalam • Series',
    type: 'series',
    tmdb: () => ({
      path: '/discover/tv',
      params: {
        with_original_language: 'ml',
        sort_by: 'popularity.desc',
        'vote_count.gte': 10,
        include_adult: 'false'
      }
    })
  },
  {
    key: 'anime-trending',
    name: 'Anime • Trending',
    type: 'series',
    tmdb: () => ({ path: '/trending/tv/week', params: {} })
  },
  {
    // Precise anime: Japanese animation, popular
    key: 'anime-top',
    name: 'Anime • Top (Japan)',
    type: 'series',
    tmdb: () => ({
      path: '/discover/tv',
      params: { with_original_language: 'ja', with_genres: '16', sort_by: 'vote_average.desc', 'vote_count.gte': 100 }
    })
  },
  {
    key: 'anime-movies',
    name: 'Anime • Movies',
    type: 'movie',
    tmdb: () => ({
      path: '/discover/movie',
      params: { with_original_language: 'ja', with_genres: '16', sort_by: 'popularity.desc', 'vote_count.gte': 50 }
    })
  },
  {
    key: 'hindi-trending',
    name: 'Hindi • Trending',
    type: 'movie',
    tmdb: () => ({
      path: '/discover/movie',
      params: {
        with_original_language: 'hi', sort_by: 'popularity.desc',
        'primary_release_date.gte': isoMonthsAgo(24),
        'vote_count.gte': 15, 'vote_average.gte': 5, include_adult: 'false'
      }
    })
  },
  {
    key: 'english-trending',
    name: 'English • Hollywood Trending',
    type: 'movie',
    tmdb: () => ({
      path: '/discover/movie',
      params: {
        with_original_language: 'en', sort_by: 'popularity.desc',
        'primary_release_date.gte': isoMonthsAgo(24),
        'vote_count.gte': 100, 'vote_average.gte': 5, include_adult: 'false', region: 'US'
      }
    })
  },
  {
    key: 'trending-day',
    name: 'Trending • Today',
    type: 'movie',
    tmdb: () => ({ path: '/trending/movie/day', params: {} })
  },
  {
    key: 'trending-week',
    name: 'Trending • This Week',
    type: 'movie',
    tmdb: () => ({ path: '/trending/all/week', params: {} })
  },
  {
    key: 'trending-series',
    name: 'Trending • Series',
    type: 'series',
    tmdb: () => ({ path: '/trending/tv/week', params: {} })
  }
];

module.exports = { CATALOGS };
