/**
 * Utility functions for RapidAPI IMDb endpoints
 * 
 * Note: RapidAPI IMDb API structure differs from TMDB.
 * These functions provide wrappers for common IMDb operations.
 */

const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'imdb8.p.rapidapi.com';

/**
 * Fetch movie news
 * @param {string} category - News category (default: 'MOVIE')
 * @param {number} first - Number of results (optional, no limit if not provided)
 * @param {string} country - Country code (default: 'US')
 * @param {string} language - Language code (default: 'en-US')
 * @returns {Promise<Object>} News data
 */
export async function fetchMovieNews(
  category = 'MOVIE',
  first = null,
  country = 'US',
  language = 'en-US'
) {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY not configured');
  }

  // Build URL without first parameter if not provided (no limit)
  const url = new URL(`https://${RAPIDAPI_HOST}/news/v2/get-by-category`);
  url.searchParams.set('category', category);
  if (first !== null && first !== undefined) {
    url.searchParams.set('first', first.toString());
  }
  url.searchParams.set('country', country);
  url.searchParams.set('language', language);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    throw new Error(`RapidAPI error: ${response.status}`);
  }

  return response.json();
}

/**
 * Search for movies by title
 * Note: This is a placeholder. You'll need to find the actual RapidAPI endpoint for movie search.
 * Common endpoint might be: /title/find or /title/v2/find
 * 
 * @param {string} query - Movie title to search for
 * @returns {Promise<Object>} Search results
 */
export async function searchMovies(query) {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY not configured');
  }

  // NOTE: This endpoint structure may need to be adjusted based on actual RapidAPI IMDb API
  // Check RapidAPI documentation for the correct endpoint
  const response = await fetch(
    `https://${RAPIDAPI_HOST}/title/v2/find?q=${encodeURIComponent(query)}`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`RapidAPI error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get movie details by IMDb ID
 * Note: This is a placeholder. You'll need to find the actual RapidAPI endpoint for movie details.
 * Common endpoint might be: /title/get-overview-details or /title/v2/get-overview-details
 * 
 * @param {string} tconst - IMDb ID (e.g., 'tt0111161')
 * @returns {Promise<Object>} Movie details
 */
export async function getMovieDetails(tconst) {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY not configured');
  }

  // NOTE: This endpoint structure may need to be adjusted based on actual RapidAPI IMDb API
  // Check RapidAPI documentation for the correct endpoint
  const response = await fetch(
    `https://${RAPIDAPI_HOST}/title/v2/get-overview-details?tconst=${tconst}`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`RapidAPI error: ${response.status}`);
  }

  return response.json();
}

/**
 * Helper function to transform TMDB-style data structure to match your components
 * This is useful if you want to use RapidAPI IMDb data with existing components
 * 
 * @param {Object} imdbMovie - Movie data from RapidAPI IMDb
 * @returns {Object} Transformed movie object matching TMDB structure
 */
export function transformImdbToTmdbFormat(imdbMovie) {
  // This is a placeholder transformation
  // Adjust based on actual RapidAPI IMDb API response structure
  return {
    id: imdbMovie.id || imdbMovie.tconst,
    title: imdbMovie.title?.text || imdbMovie.titleText?.text,
    overview: imdbMovie.plot?.plotText?.plainText || '',
    release_date: imdbMovie.releaseDate?.year
      ? `${imdbMovie.releaseDate.year}-${String(imdbMovie.releaseDate.month || 1).padStart(2, '0')}-${String(imdbMovie.releaseDate.day || 1).padStart(2, '0')}`
      : null,
    poster_path: imdbMovie.primaryImage?.url || null,
    backdrop_path: imdbMovie.primaryImage?.url || null,
    vote_count: imdbMovie.ratingsSummary?.voteCount || 0,
    vote_average: imdbMovie.ratingsSummary?.aggregateRating || 0,
  };
}

