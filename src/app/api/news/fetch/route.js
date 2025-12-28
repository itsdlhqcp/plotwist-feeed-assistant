/**
 * Manual trigger endpoint to fetch and store news from RapidAPI
 * This can be used for testing or manual data refresh
 */
import { fetchAndStoreNewsFromRapidAPI } from '@/lib/utils/fetchAndStoreNews';

export async function POST(request) {
  try {
    console.log('Manual news fetch triggered');
    const result = await fetchAndStoreNewsFromRapidAPI();
    
    return Response.json({
      success: true,
      message: 'News fetched and stored successfully',
      stats: result,
    });
  } catch (error) {
    console.error('Manual news fetch failed:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch and store news',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  // Allow GET to also trigger fetch for easier testing
  try {
    console.log('Manual news fetch triggered via GET');
    const result = await fetchAndStoreNewsFromRapidAPI();
    
    return Response.json({
      success: true,
      message: 'News fetched and stored successfully',
      stats: result,
    });
  } catch (error) {
    console.error('Manual news fetch failed:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch and store news',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

