// Curated fallback — real IMDb IDs so the addon works even without a TMDB key.
// Malayalam heavy + a little anime / hindi / english.

const POSTER = (tt) => `https://images.metahub.space/poster/medium/${tt}/img`;

function meta(id, type, name, year) {
  return {
    id,
    type,
    name,
    poster: POSTER(id),
    releaseInfo: year ? String(year) : undefined,
    posterShape: 'poster'
  };
}

const STATIC_CATALOGS = {
  // FRESH Malayalam only (2023-2025). No old classics, no Tamil/Kannada mix.
  // Newest first.
  'ml-trending': [
    meta('tt32237230', 'movie', 'Thudarum', 2025),
    meta('tt31340516', 'movie', 'L2: Empuraan', 2025),
    meta('tt26442968', 'movie', 'Kishkindha Kaanda', 2024),
    meta('tt21231288', 'movie', 'Manjummel Boys', 2024),
    meta('tt26625647', 'movie', 'Aavesham', 2024),
    meta('tt25473608', 'movie', 'Premalu', 2024),
    meta('tt24398884', 'movie', 'Bramayugam', 2024),
    meta('tt15323744', 'movie', '2018', 2023),
    meta('tt13066942', 'movie', 'Romancham', 2023)
  ],
  'ml-new': [
    meta('tt32237230', 'movie', 'Thudarum', 2025),
    meta('tt31340516', 'movie', 'L2: Empuraan', 2025),
    meta('tt26442968', 'movie', 'Kishkindha Kaanda', 2024),
    meta('tt21231288', 'movie', 'Manjummel Boys', 2024),
    meta('tt26625647', 'movie', 'Aavesham', 2024),
    meta('tt25473608', 'movie', 'Premalu', 2024),
    meta('tt24398884', 'movie', 'Bramayugam', 2024),
    meta('tt15323744', 'movie', '2018', 2023),
    meta('tt13066942', 'movie', 'Romancham', 2023)
  ],
  'ml-top': [
    meta('tt4144512', 'movie', 'Drishyam', 2013),
    meta('tt12573454', 'movie', 'Kumbalangi Nights', 2019),
    meta('tt4987556', 'movie', 'Premam', 2015),
    meta('tt11568948', 'movie', 'The Great Indian Kitchen', 2021),
    meta('tt9570746', 'movie', 'Nayattu', 2021),
    meta('tt9548722', 'movie', 'Joji', 2021),
    meta('tt7374948', 'movie', 'Bangalore Days', 2014),
    meta('tt14898440', 'movie', 'Minnal Murali', 2021),
    meta('tt12789596', 'movie', 'Hridayam', 2022)
  ],
  'ml-series': [
    meta('tt14452776', 'series', 'The Family Man', 2019),
    meta('tt7661750', 'series', 'Suzhal: The Vortex', 2022),
    meta('tt14641250', 'series', 'Kerala Crime Files', 2023),
    meta('tt15327074', 'series', 'Panchayat', 2020),
    meta('tt8879940', 'series', 'Kota Factory', 2019)
  ],
  'anime-trending': [
    meta('tt0409591', 'series', 'Naruto', 2002),
    meta('tt2560140', 'series', 'Attack on Titan', 2013),
    meta('tt9335498', 'series', 'Demon Slayer', 2019),
    meta('tt0877057', 'series', 'Death Note', 2006),
    meta('tt12343534', 'series', 'Jujutsu Kaisen', 2020),
    meta('tt14681997', 'series', 'Solo Leveling', 2024),
    meta('tt1528406', 'series', 'One Piece', 1999),
    meta('tt5626028', 'series', 'My Hero Academia', 2016),
    meta('tt15434519', 'series', 'Frieren: Beyond Journey\'s End', 2023),
    meta('tt1910272', 'series', 'Steins;Gate', 2011),
    meta('tt1355642', 'movie', 'Spirited Away', 2001),
    meta('tt9362722', 'movie', 'Your Name', 2016)
  ],
  'anime-top': [
    meta('tt2560140', 'series', 'Attack on Titan', 2013),
    meta('tt9335498', 'series', 'Demon Slayer', 2019),
    meta('tt0877057', 'series', 'Death Note', 2006),
    meta('tt12343534', 'series', 'Jujutsu Kaisen', 2020),
    meta('tt15434519', 'series', "Frieren: Beyond Journey's End", 2023),
    meta('tt1910272', 'series', 'Steins;Gate', 2011),
    meta('tt1528406', 'series', 'One Piece', 1999),
    meta('tt5626028', 'series', 'My Hero Academia', 2016)
  ],
  'anime-movies': [
    meta('tt1355642', 'movie', 'Spirited Away', 2001),
    meta('tt9362722', 'movie', 'Your Name', 2016),
    meta('tt14986494', 'movie', 'Suzume', 2022),
    meta('tt3824438', 'movie', 'A Silent Voice', 2016),
    meta('tt5311514', 'movie', 'Your Name', 2016),
    meta('tt1560970', 'movie', 'Howl\'s Moving Castle', 2004)
  ],
  'hindi-trending': [
    meta('tt15354916', 'movie', 'Jawan', 2023),
    meta('tt12735488', 'movie', 'Animal', 2023),
    meta('tt14993250', 'movie', 'Pathaan', 2023),
    meta('tt15748830', 'movie', '12th Fail', 2023),
    meta('tt8178634', 'movie', 'Dangal', 2016),
    meta('tt1837036', 'movie', '3 Idiots', 2009),
    meta('tt9660502', 'movie', 'Gully Boy', 2019),
    meta('tt10804222', 'movie', 'Shaitaan', 2024),
    meta('tt1954470', 'movie', 'Stree 2', 2024)
  ],
  'english-trending': [
    meta('tt14935386', 'movie', 'Oppenheimer', 2023),
    meta('tt1160419', 'movie', 'Dune: Part Two', 2024),
    meta('tt9362722', 'movie', 'Spider-Man: Across the Spider-Verse', 2023),
    meta('tt1517268', 'movie', 'Barbie', 2023),
    meta('tt15398776', 'movie', 'John Wick: Chapter 4', 2023),
    meta('tt1254207', 'movie', 'Big Buck Bunny', 2008),
    meta('tt6718170', 'series', 'The Last of Us', 2023),
    meta('tt4574334', 'series', 'Stranger Things', 2016),
    meta('tt0903747', 'series', 'Breaking Bad', 2008),
    meta('tt1475582', 'series', 'Sherlock', 2010)
  ],
  'trending-day': [
    meta('tt32237230', 'movie', 'Thudarum', 2025),
    meta('tt21231288', 'movie', 'Manjummel Boys', 2024),
    meta('tt26625647', 'movie', 'Aavesham', 2024),
    meta('tt25473608', 'movie', 'Premalu', 2024),
    meta('tt1160419', 'movie', 'Dune: Part Two', 2024),
    meta('tt14935386', 'movie', 'Oppenheimer', 2023)
  ],
  'trending-week': [
    meta('tt31340516', 'movie', 'L2: Empuraan', 2025),
    meta('tt26442968', 'movie', 'Kishkindha Kaanda', 2024),
    meta('tt24398884', 'movie', 'Bramayugam', 2024),
    meta('tt1160419', 'movie', 'Dune: Part Two', 2024),
    meta('tt14935386', 'movie', 'Oppenheimer', 2023),
    meta('tt15354916', 'movie', 'Jawan', 2023)
  ],
  'trending-series': [
    meta('tt14681997', 'series', 'Solo Leveling', 2024),
    meta('tt12343534', 'series', 'Jujutsu Kaisen', 2020),
    meta('tt9335498', 'series', 'Demon Slayer', 2019),
    meta('tt15434519', 'series', "Frieren: Beyond Journey's End", 2023),
    meta('tt14641250', 'series', 'Kerala Crime Files', 2023),
    meta('tt6718170', 'series', 'The Last of Us', 2023)
  ]
};

module.exports = { STATIC_CATALOGS };
