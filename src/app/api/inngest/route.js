import { serve } from 'inngest/next';
import { inngest } from '../../../inngest/client';
import {
  generateHomePageContent,
  helloWorld,
  fetchAndStoreNews,
} from '../../../inngest/functions';

// Inngest serve handler - automatically handles signing key verification in production
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld, // <-- This is where you'll always add all your functions
    generateHomePageContent,
    fetchAndStoreNews, // Fetch news from RapidAPI twice daily and store in MongoDB
  ],
  // The serve function automatically uses INNGEST_SIGNING_KEY if set
  // No additional configuration needed for Vercel deployment
});
