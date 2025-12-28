/**
 * Debug endpoint to check database contents and connection
 */
import { connect } from '@/lib/mongodb/mongoose';
import NewsArticle from '@/lib/models/newsArticle.model';

export async function GET(request) {
  try {
    await connect();
    
    // Get total count
    const totalCount = await NewsArticle.countDocuments();
    
    // Get sample articles
    const sampleArticles = await NewsArticle.find()
      .limit(5)
      .select('articleId category country articleTitle createdAt lastFetched')
      .lean();
    
    // Get articles by category
    const movieCount = await NewsArticle.countDocuments({ category: 'MOVIE' });
    const tvCount = await NewsArticle.countDocuments({ category: 'TV' });
    
    // Get articles by country
    const usCount = await NewsArticle.countDocuments({ country: 'US' });
    const gbCount = await NewsArticle.countDocuments({ country: 'GB' });
    
    // Get most recent article
    const mostRecent = await NewsArticle.findOne()
      .sort({ lastFetched: -1 })
      .select('articleId category country lastFetched createdAt')
      .lean();
    
    return Response.json({
      success: true,
      database: {
        totalArticles: totalCount,
        byCategory: {
          MOVIE: movieCount,
          TV: tvCount,
        },
        byCountry: {
          US: usCount,
          GB: gbCount,
        },
        mostRecent: mostRecent,
        sampleArticles: sampleArticles,
      },
      environment: {
        hasRapidAPIKey: !!process.env.RAPIDAPI_KEY,
        hasMongoURI: !!process.env.MONGODB_URI,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return Response.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}



