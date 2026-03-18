// TMDB API configuration
// Get your free API key from: https://www.themoviedb.org/settings/api
// Replace 'your_tmdb_api_key_here' with your actual API key
const TMDB_API_KEY = 'e7fbb2b4eb872ba8bab05b00da245047'; // 🔑 TMDB API key configured
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Cache for poster URLs to avoid repeated API calls
const posterCache = new Map();
const refinedcache = new Map();

export const fetchMoviePoster = async (movieTitle, year) => {
  // Check cache first
  const cacheKey = `${movieTitle}-${year}`;
  if (posterCache.has(cacheKey)) {
    return posterCache.get(cacheKey);
  }

  // If no API key is set, return null (will show placeholder)
  if (TMDB_API_KEY === 'your_tmdb_api_key_here') {
    console.warn('⚠️ TMDB API key not set. Please get a free API key from https://www.themoviedb.org/settings/api and replace TMDB_API_KEY in tmdbService.js');
    posterCache.set(cacheKey, null);
    return null;
  }

  try {
    // Search for the movie
    const searchResponse = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieTitle)}&year=${year}`
    );

    if (!searchResponse.ok) {
      throw new Error(`TMDB API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();

    if (searchData.results && searchData.results.length > 0) {
      // Get the first result (most relevant)
      const movie = searchData.results[0];
      const posterUrl = movie.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
        : null;

      // Cache the result
      posterCache.set(cacheKey, posterUrl);
      return posterUrl;
    }

    // Cache null result to avoid repeated failed searches
    posterCache.set(cacheKey, null);
    return null;
  } catch (error) {
    console.error('Error fetching movie poster:', error);
    // Cache null on error
    posterCache.set(cacheKey, null);
    return null;
  }
};

export const fetchMovieOverview = async (movieTitle, year) => {
  const cacheKey = `overview-${movieTitle}-${year}`;
  
  if (refinedcache.has(cacheKey)) {
    return refinedcache.get(cacheKey);
  }

  try {
    const searchResponse = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieTitle)}&year=${year}`
    );

    const searchData = await searchResponse.json();

    if (searchData.results && searchData.results.length > 0) {
      const movieSummary = searchData.results[0];

      const detailResponse = await fetch(
        `${TMDB_BASE_URL}/movie/${movieSummary.id}?api_key=${TMDB_API_KEY}`
      );
      const fullData = await detailResponse.json(); 

      const result = {
        overview: fullData.overview,
        rating: fullData.vote_average,
        runtime: fullData.runtime,
        budget: fullData.budget,     
        revenue: fullData.revenue
      };
      refinedcache.set(cacheKey, result);
      return result;
    }

    return { overview: "No description available.", rating: 0, runtime: 0, budget: 0 };
  } catch (error) {
    console.error('Error fetching overview:', error);
    return null;
  }
};