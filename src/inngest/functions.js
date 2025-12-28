import { GoogleGenerativeAI } from '@google/generative-ai';
import { inngest } from './client';
import { connect } from '@/lib/mongodb/mongoose';
import HomePageContent from '@/lib/models/homePageContent.model';
import { fetchAndStoreNewsFromRapidAPI } from '@/lib/utils/fetchAndStoreNews';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    await step.sleep('wait-a-moment', '10s');
    return { message: `Hello ${event.data.email}!` };
  }
);

export const generateHomePageContent = inngest.createFunction(
  { id: 'generate-homepage-content', name: 'Generate home page content' },
  { cron: '0 0 * * 0' }, // Run every sunday at midnight
  async ({ event, step }) => {
    // Fetch movie news from RapidAPI IMDb
    const movieNewsResults = await step.run(
      'fetch-movie-news',
      async () => {
        const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
        const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'imdb8.p.rapidapi.com';

        if (!RAPIDAPI_KEY) {
          throw new Error('RAPIDAPI_KEY not configured');
        }

        const res = await fetch(
          `https://${RAPIDAPI_HOST}/news/v2/get-by-category?category=MOVIE&country=US&language=en-US`,
          {
            method: 'GET',
            headers: {
              'x-rapidapi-key': RAPIDAPI_KEY,
              'x-rapidapi-host': RAPIDAPI_HOST,
            },
          }
        );
        
        if (!res.ok) {
          throw new Error('Failed to fetch movie news');
        }
        
        const data = await res.json();
        return data?.data?.news?.edges || []; // Get all news articles
      }
    );

    const prompt = `
    Analyze these movie news articles: ${JSON.stringify(
      movieNewsResults.map(edge => ({
        title: edge.node?.articleTitle?.plainText,
        text: edge.node?.text?.plainText?.substring(0, 200)
      }))
    )} and provide a title and description in ONLY the following JSON format without any additional notes or explanations:
    {
      "title": "exciting title about latest movie news and updates",
      "description": "exciting description about the latest movie news, trends, and entertainment industry updates (at least 150 characters)"
    }
    
    IMPORTANT: Return ONLY the JSON. No additional text, notes.
    Include at least 150 characters for description.
    Include at least 50 characters for title.
  `;

    const googleGeminiResults = await step.ai.wrap(
      'gemini',
      async (p) => {
        return await model.generateContent(p);
      },
      prompt
    );

    const text =
      googleGeminiResults.response.candidates[0].content.parts[0].text || '';
    const cleanedText = text.replace(/```(?:json)?\n?/g, '').trim();

    const homePageContentFromGoogleGemini = JSON.parse(cleanedText);

    // Save the generated content to the database which is mongoDB

    const createOrUpdateHomePageContent = async (title, description) => {
      try {
        await connect();
        const SavedHomePageContent = await HomePageContent.findOneAndUpdate(
          { updatedBy: 'inngest' },
          {
            $set: {
              title,
              description,
              updatedBy: 'inngest',
            },
          },
          { new: true, upsert: true }
        );
        return SavedHomePageContent;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to create or update home page content');
      }
    };

    await step.run('Create or update home page content', async () => {
      await createOrUpdateHomePageContent(
        homePageContentFromGoogleGemini.title,
        homePageContentFromGoogleGemini.description
      );
    });
  }
);

/**
 * Fetch news from RapidAPI twice daily (12:00 AM and 12:00 PM) and store in MongoDB
 * This ensures we only call RapidAPI twice per day and serve data from DB for all other requests
 */
export const fetchAndStoreNews = inngest.createFunction(
  { id: 'fetch-and-store-news', name: 'Fetch and store news from RapidAPI' },
  { cron: '0 0,12 * * *' }, // Run at 12:00 AM and 12:00 PM every day
  async ({ event, step }) => {
    // Use the shared utility function
    const stats = await step.run('fetch-and-store-news', async () => {
      return await fetchAndStoreNewsFromRapidAPI();
    });

    return {
      message: 'News fetched and stored successfully',
      stats,
    };
  }
);
