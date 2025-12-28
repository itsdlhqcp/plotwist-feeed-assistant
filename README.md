# PLOTWIST

A Next.js application with Inngest workflows, MongoDB, and AI-powered content generation using Google Gemini for movie news and entertainment updates.

## Prerequisites

Before you begin, make sure you have accounts for the following services:
- MongoDB Atlas
- The Movie Database (TMDB) - **OR** RapidAPI IMDb API
- Google Gemini AI
- RapidAPI (for IMDb news and optional movie data)

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# TMDB API (for movie listings, search, and details)
API_KEY=your_tmdb_api_key_here

# RapidAPI IMDb API (for movie news and optional movie data)
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=imdb8.p.rapidapi.com

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Application URL
URL=http://localhost:3000
```

### 3. How to Get All Credentials

#### MongoDB URI
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Go to "Database Access" and create a database user
4. Go to "Network Access" and add your IP address (or 0.0.0.0/0 for development)
5. Click "Connect" on your cluster → "Connect your application"
6. Copy the connection string and replace `<password>` with your database user password
7. Format: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/`

#### TMDB API Key (Optional - for movie listings/details)
1. Sign up at [The Movie Database](https://www.themoviedb.org/)
2. Go to Settings → API
3. Request an API key (select "Developer" option)
4. Fill out the application form
5. Copy your API key (v3 auth) from the API settings page

#### RapidAPI IMDb API Credentials (for movie news)
1. Sign up at [RapidAPI](https://rapidapi.com/)
2. Navigate to the [IMDb API](https://rapidapi.com/apidojo/api/imdb8) page
3. Click "Subscribe" and choose a plan (free tier available)
4. After subscribing, go to your [RapidAPI Dashboard](https://rapidapi.com/developer/dashboard)
5. Copy your "X-RapidAPI-Key" → use for `RAPIDAPI_KEY`
6. The host is: `imdb8.p.rapidapi.com` → use for `RAPIDAPI_HOST`

**⚠️ Security Note:** Never commit your API keys to version control. If your API key has been exposed publicly, rotate it immediately from your RapidAPI dashboard.

**Note:** The RapidAPI IMDb API is currently used for the **movie news feature**. To replace TMDB entirely for movie listings/details, you'll need to find the appropriate RapidAPI IMDb endpoints (see "Replacing TMDB with RapidAPI IMDb" section below).

#### Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

#### Application URL
- For local development: `http://localhost:3000`
- For production: Your production domain (e.g., `https://your-app.vercel.app`)

## Running the Application

### Terminal 1: Next.js Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Terminal 2: Inngest Dev Server

Open a **separate terminal window** and run:

```bash
npx inngest-cli@latest dev
```

This will start the Inngest development server that connects to your Inngest endpoint at `/api/inngest`. It provides a local UI for testing and debugging your Inngest functions.

**Important:** Both terminals must be running simultaneously for the application to work properly with Inngest workflows.

## Project Structure

- `/src/app` - Next.js app router pages and API routes
- `/src/components` - React components
- `/src/inngest` - Inngest client and functions
- `/src/lib` - Utility functions, models, and database connections
- `/src/middleware.js` - Next.js middleware

## Features

- Movie search and trending movies via TMDB API
- **Movie news articles via RapidAPI IMDb API** 🆕
- AI-powered homepage content generation with Google Gemini
- Scheduled Inngest workflows for automated content updates
- Dark mode support
- MongoDB for data persistence

## Replacing TMDB with RapidAPI IMDb (Optional)

Currently, the app uses TMDB for movie listings, search, and details. The RapidAPI IMDb integration is set up for **movie news**. If you want to replace TMDB entirely with RapidAPI IMDb for movie data, follow these steps:

### Available RapidAPI IMDb Endpoints

1. **Movie News** (✅ Already implemented)
   - Endpoint: `/news/v2/get-by-category`
   - Used in: `/news` page

2. **Movie Search** (📋 To be implemented)
   - Potential endpoints: `/title/v2/find` or `/title/find`
   - Would replace: `src/app/search/[searchTerm]/page.jsx`
   - Check [RapidAPI IMDb Documentation](https://rapidapi.com/apidojo/api/imdb8) for exact endpoint

3. **Movie Details** (📋 To be implemented)
   - Potential endpoints: `/title/v2/get-overview-details` or `/title/get-overview-details`
   - Would replace: `src/app/movie/[id]/page.jsx`
   - Requires IMDb ID (tconst) instead of TMDB ID

4. **Trending/Top Rated Movies** (📋 To be implemented)
   - Check RapidAPI IMDb for "most popular" or "top movies" endpoints
   - Would replace: `src/app/page.js` and `src/app/top/[genre]/page.jsx`

### Implementation Guide

Utility functions are already created in `src/lib/utils/imdb-api.js`:
- `fetchMovieNews()` - ✅ Implemented
- `searchMovies()` - 📋 Placeholder (needs endpoint verification)
- `getMovieDetails()` - 📋 Placeholder (needs endpoint verification)
- `transformImdbToTmdbFormat()` - Helper to convert IMDb data to TMDB format

**Steps to replace TMDB:**
1. Verify the correct RapidAPI IMDb endpoints from their documentation
2. Update the utility functions in `src/lib/utils/imdb-api.js`
3. Replace TMDB API calls in pages with RapidAPI IMDb calls
4. Update data transformation logic to match IMDb response structure
5. Update components (`Card.jsx`, `Results.jsx`) if data structure differs

**Important Notes:**
- RapidAPI IMDb uses IMDb IDs (tconst like "tt0111161") instead of TMDB numeric IDs
- Image URLs structure may differ - IMDb may not provide the same image CDN as TMDB
- Response data structures are different, so transformation functions are needed

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Inngest Documentation](https://www.inngest.com/docs) - learn about Inngest workflows
- [TMDB API Documentation](https://developers.themoviedb.org/3) - TMDB API reference
- [RapidAPI IMDb API](https://rapidapi.com/apidojo/api/imdb8) - RapidAPI IMDb API documentation

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

**📖 For detailed deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

**Quick Checklist:**
1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in Vercel Dashboard
3. Add all environment variables in Vercel project settings
4. Configure Inngest for production (Inngest Cloud recommended)
5. Update MongoDB network access to allow Vercel
6. Redeploy after adding environment variables

**Required Environment Variables for Vercel:**
- `MONGODB_URI`
- `RAPIDAPI_KEY`
- `RAPIDAPI_HOST`
- `GEMINI_API_KEY`
- `URL` / `NEXT_PUBLIC_URL` (set to your Vercel deployment URL)
- `INNGEST_SIGNING_KEY` (if using Inngest Cloud)
- `INNGEST_EVENT_KEY` (if using Inngest Cloud)
