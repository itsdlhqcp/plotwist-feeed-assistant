import { connect } from '@/lib/mongodb/mongoose';
import NewsArticle from '@/lib/models/newsArticle.model';
import { fetchAndStoreNewsFromRapidAPI } from '@/lib/utils/fetchAndStoreNews';

// Simple in-memory flag to prevent multiple simultaneous fetches
let isFetching = false;
let lastFetchAttempt = 0;
const FETCH_COOLDOWN = 5 * 60 * 1000; // 5 minutes cooldown between fetch attempts

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  // Make filters optional - if not provided, get all data
  const category = searchParams.get('category');
  const first = searchParams.get('first') ? parseInt(searchParams.get('first'), 10) : null; // null = no limit
  const country = searchParams.get('country');
  const language = searchParams.get('language');

  try {
    // Connect to MongoDB
    await connect();

    // Build query filter - only add filters if explicitly provided
    const query = {};
    
    // Category filter - only if provided and not 'ALL'
    if (category && category !== 'ALL') {
      query.category = category.toUpperCase();
    }
    
    // Country filter - only if provided and not 'ALL'
    if (country && country !== 'ALL') {
      query.country = country.toUpperCase();
    }
    
    console.log('Query filter:', JSON.stringify(query));

    // Check if we need to fetch fresh data
    // First check if ANY article exists (without filters)
    const anyArticle = await NewsArticle.findOne()
      .sort({ lastFetched: -1 })
      .select('lastFetched')
      .lean();
    
    // Then check with filters
    const mostRecentArticle = await NewsArticle.findOne(query)
      .sort({ lastFetched: -1 })
      .select('lastFetched')
      .lean();
    
    console.log('Database check:', {
      anyArticleExists: !!anyArticle,
      filteredArticleExists: !!mostRecentArticle,
      anyArticleLastFetched: anyArticle?.lastFetched,
      filteredArticleLastFetched: mostRecentArticle?.lastFetched,
    });

    const now = Date.now();
    // Check if database is completely empty (no articles at all)
    const isDatabaseEmpty = !anyArticle || !anyArticle.lastFetched;
    // Check if filtered data is empty or stale
    const isFilteredDataEmpty = !mostRecentArticle || !mostRecentArticle.lastFetched;
    const isFilteredDataStale = mostRecentArticle && mostRecentArticle.lastFetched && 
      (now - new Date(mostRecentArticle.lastFetched).getTime()) > 12 * 60 * 60 * 1000;
    
    const shouldFetchFreshData = isDatabaseEmpty || isFilteredDataEmpty || isFilteredDataStale;
    
    console.log('Fetch decision:', {
      isDatabaseEmpty,
      isFilteredDataEmpty,
      isFilteredDataStale,
      shouldFetchFreshData,
    });

    // If database is empty, wait for the fetch to complete
    // If data is stale, fetch in background and return existing data
    if (shouldFetchFreshData && !isFetching && (now - lastFetchAttempt) > FETCH_COOLDOWN) {
      isFetching = true;
      lastFetchAttempt = now;
      
      if (isDatabaseEmpty) {
        // Wait for initial fetch if database is empty
        try {
          console.log('Database is empty, fetching news from RapidAPI...');
          const result = await fetchAndStoreNewsFromRapidAPI();
          console.log('Initial news fetch completed:', result);
        } catch (error) {
          console.error('Initial news fetch failed:', error);
          throw error; // Re-throw if initial fetch fails
        } finally {
          isFetching = false;
        }
      } else {
        // Background fetch for stale data
        fetchAndStoreNewsFromRapidAPI()
          .then((result) => {
            console.log('Background news fetch completed successfully:', result);
          })
          .catch(error => {
            console.error('Background news fetch failed:', error);
            // Don't throw - we'll return existing data even if fetch fails
          })
          .finally(() => {
            isFetching = false;
          });
      }
    }

    // Fetch news articles from MongoDB, sorted by most recent first
    // Get ALL articles if no limit specified
    let articlesQuery = NewsArticle.find(query).sort({ createdAt: -1 });
    
    // Only apply limit if specified
    if (first && first > 0) {
      articlesQuery = articlesQuery.limit(first);
    }
    
    const articles = await articlesQuery.lean(); // Use lean() for better performance

    // Transform MongoDB documents to match the expected API response format
    const edges = articles.map((article) => ({
      node: {
        id: article.articleId,
        articleTitle: {
          plainText: article.articleTitle?.plainText || 'No title',
        },
        text: {
          plainText: article.text?.plainText || '',
        },
        image: {
          url: article.image?.url || null,
        },
        byline: article.byline || null,
        date: article.date || article.createdAt,
        externalUrl: article.externalUrl || null,
        category: article.category,
        country: article.country,
        language: article.language,
      },
    }));

    // Log for debugging
    if (edges.length === 0) {
      console.log('No articles found in database for query:', query);
    } else {
      console.log(`Returning ${edges.length} articles from database`);
    }

    // Return data in the same format as RapidAPI response
    const responseData = {
      data: {
        news: {
          edges: edges,
        },
      },
    };

    return Response.json(responseData);
  } catch (error) {
    console.error('Error fetching news from database:', error);
    return Response.json(
      { 
        error: 'Failed to fetch news', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

