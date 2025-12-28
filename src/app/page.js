// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

import { connect } from '@/lib/mongodb/mongoose';
import NewsArticle from '@/lib/models/newsArticle.model';

export default async function NewsPage() {
  let newsData = null;
  let error = null;

  try {
    // Connect to MongoDB
    await connect();

    // Fetch news articles directly from MongoDB, sorted by most recent first
    const articles = await NewsArticle.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Transform MongoDB documents to match the expected format
    newsData = articles.map((article) => ({
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

    console.log(`Fetched ${newsData.length} articles from database`);
  } catch (err) {
    console.error('Error fetching news:', err);
    error = err.message || 'Unknown error occurred';
  }

  if (error) {
    return (
      <div className='text-center mt-10 max-w-2xl mx-auto px-4'>
        <h1 className='text-xl my-5 text-red-500'>Error loading news</h1>
        <p className='text-gray-600 mb-4'>{error}</p>
        <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded text-left text-sm'>
          <p className='font-semibold mb-2'>Debug Info:</p>
          <p>Error: {error}</p>
        </div>
        <a 
          href='/api/news/fetch' 
          className='mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
        >
          Try Manual Fetch
        </a>
      </div>
    );
  }

  if (!newsData || newsData.length === 0) {
    return (
      <div className='max-w-6xl mx-auto py-8 px-4'>
        <h1 className='text-4xl font-extrabold mb-4 text-center'>
          <span className='text-red-600 dark:text-red-500'>PLOT</span>
          <span className='text-blue-600 dark:text-blue-500'>TWIST</span>
        </h1>
        <div className='text-center mb-8'>
          <form action='/api/news/fetch' method='POST' className='inline-block'>
            <button 
              type='submit'
              className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105'
            >
              🔄 Fetch Latest News from RapidAPI
            </button>
          </form>
        </div>
        <div className='text-center mt-10 max-w-2xl mx-auto px-4'>
          <h1 className='text-xl my-5'>No news available at the moment</h1>
          <p className='text-gray-600 mb-4'>
            The database might be empty. Click the button above to fetch news from RapidAPI.
          </p>
          <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded text-left text-sm mb-4'>
            <p className='font-semibold mb-2'>Debug Info:</p>
            <p>News Data: {newsData ? `Array with ${newsData.length} items` : 'null'}</p>
          </div>
          <div className='space-x-4'>
            <a 
              href='/api/news/debug' 
              target='_blank'
              className='inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600'
            >
              Check Database (Debug)
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto py-8 px-4'>
      <h1 className='text-4xl font-extrabold mb-4 text-center'>
        <span className='text-red-600 dark:text-red-500'>PLOT</span>
        <span className='text-blue-600 dark:text-blue-500'>TWIST</span>
      </h1>
      <div className='text-center mb-8'>
        <p className='text-lg text-gray-600 dark:text-gray-400 mb-4'>
          Showing <span className='font-bold text-blue-600 dark:text-blue-400'>{newsData.length}</span> news articles from database
        </p>
        <form action='/api/news/fetch' method='POST' className='inline-block'>
          <button 
            type='submit'
            className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105'
          >
            🔄 Fetch Latest News from RapidAPI
          </button>
        </form>
      </div>
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {newsData.map((edge) => {
          const article = edge.node;
          return (
            <div
              key={article.id}
              className='bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300'
            >
              {article.image?.url && (
                <img
                  src={article.image.url}
                  alt={article.articleTitle?.plainText || 'News article'}
                  className='w-full h-48 object-cover'
                />
              )}
              <div className='p-4'>
                <div className='flex gap-2 mb-2 flex-wrap'>
                  {article.category && (
                    <span className='px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
                      {article.category}
                    </span>
                  )}
                  {article.country && (
                    <span className='px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                      {article.country}
                    </span>
                  )}
                </div>
                <h2 className='text-xl font-bold mb-2 line-clamp-2 dark:text-white'>
                  {article.articleTitle?.plainText || 'No title'}
                </h2>
                {article.byline && (
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                    By {article.byline}
                  </p>
                )}
                {article.date && (
                  <p className='text-xs text-gray-500 dark:text-gray-500 mb-3'>
                    {new Date(article.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
                {article.text?.plainText && (
                  <p className='text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-4'>
                    {article.text.plainText}
                  </p>
                )}
                {article.externalUrl && (
                  <a
                    href={article.externalUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-semibold'
                  >
                    Read More →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
