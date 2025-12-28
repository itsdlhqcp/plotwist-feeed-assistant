/**
 * Utility function to fetch news from RapidAPI and store in MongoDB
 * This can be called from API routes or Inngest functions
 */
import { connect } from '@/lib/mongodb/mongoose';
import NewsArticle from '@/lib/models/newsArticle.model';

export async function fetchAndStoreNewsFromRapidAPI() {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'imdb8.p.rapidapi.com';

  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY not configured');
  }

  // Fetch multiple categories and countries for comprehensive data
  const categories = ['MOVIE', 'TV'];
  const countries = ['US', 'GB'];
  const allNews = [];

  for (const category of categories) {
    for (const country of countries) {
      try {
        // RapidAPI might require the 'first' parameter, so we'll use a high value
        // to get as much data as possible
        const res = await fetch(
          `https://${RAPIDAPI_HOST}/news/v2/get-by-category?category=${category}&first=1000&country=${country}&language=en-US`,
          {
            method: 'GET',
            headers: {
              'x-rapidapi-key': RAPIDAPI_KEY,
              'x-rapidapi-host': RAPIDAPI_HOST,
            },
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`RapidAPI error for ${category}/${country}:`, res.status, errorText);
          throw new Error(`RapidAPI returned ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        const edges = data?.data?.news?.edges || [];
        
        console.log(`Fetched ${edges.length} articles for ${category}/${country}`);
        
        // Add category and country to each article
        edges.forEach(edge => {
          if (edge.node) {
            allNews.push({
              ...edge,
              node: {
                ...edge.node,
                category,
                country,
              },
            });
          }
        });
      } catch (error) {
        console.error(`Error fetching news for ${category}/${country}:`, error);
        // Continue with other categories/countries even if one fails
      }
    }
  }

  console.log(`Total articles fetched from RapidAPI: ${allNews.length}`);

  if (allNews.length === 0) {
    console.warn('No news articles fetched from RapidAPI');
    return {
      saved: 0,
      updated: 0,
      skipped: 0,
      total: 0,
    };
  }

  // Connect to MongoDB
  await connect();
  
  let savedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const edge of allNews) {
    const article = edge.node;
    
    if (!article) {
      skippedCount++;
      continue;
    }

    // Generate unique article ID - use RapidAPI ID if available, otherwise generate one
    // Use externalUrl as fallback identifier, then title + date, then generate unique hash
    let articleId = article.id;
    
    if (!articleId && article.externalUrl) {
      // Use URL hash as ID if available
      try {
        const urlHash = Buffer.from(article.externalUrl).toString('base64').substring(0, 50);
        articleId = `news_url_${urlHash}`;
      } catch (e) {
        // Fallback if URL encoding fails
      }
    }
    
    if (!articleId) {
      // Generate unique ID from title + date + random
      const titleHash = article.articleTitle?.plainText
        ?.substring(0, 30)
        ?.replace(/[^a-zA-Z0-9]/g, '_')
        ?.toLowerCase() || 'untitled';
      const dateStr = article.date ? new Date(article.date).getTime() : Date.now();
      const randomStr = Math.random().toString(36).substring(2, 9);
      articleId = `news_${titleHash}_${dateStr}_${randomStr}`;
    }

    try {
      // Prepare article data
      const articleData = {
        articleId,
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
        date: article.date ? new Date(article.date) : null,
        externalUrl: article.externalUrl || null,
        category: article.category || 'MOVIE',
        country: article.country || 'US',
        language: 'en-US',
        rawData: article,
        lastFetched: new Date(),
      };

      // Check if article already exists
      const existingArticle = await NewsArticle.findOne({ articleId });
      
      // Upsert: update if exists, create if new
      const result = await NewsArticle.findOneAndUpdate(
        { articleId },
        {
          $set: articleData,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      // Track if it's a new document
      if (!existingArticle) {
        savedCount++;
      } else {
        updatedCount++;
      }
    } catch (error) {
      console.error(`Error storing article ${articleId}:`, error);
      skippedCount++;
    }
  }

  const result = {
    saved: savedCount,
    updated: updatedCount,
    skipped: skippedCount,
    total: allNews.length,
  };

  console.log('News storage completed:', result);
  return result;
}

