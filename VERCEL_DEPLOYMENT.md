# Vercel Deployment Guide

This guide will help you deploy your PLOTWIST Next.js application to Vercel with Inngest workflows.

## Prerequisites

- A Vercel account ([Sign up here](https://vercel.com/signup))
- All API keys and credentials ready (see README.md for details)
- Inngest Cloud account (recommended for production) or self-hosted Inngest

## Step 1: Prepare Your Repository

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Ensure `.env.local` is in `.gitignore`** (should already be there)

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js framework
5. Click **"Deploy"** (don't add environment variables yet - we'll do that next)

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

## Step 3: Configure Environment Variables

After your first deployment, configure environment variables in Vercel:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

### Required Environment Variables

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# RapidAPI IMDb API
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=imdb8.p.rapidapi.com

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Application URL (Update after first deployment)
URL=https://your-app.vercel.app
NEXT_PUBLIC_URL=https://your-app.vercel.app

# Inngest Configuration (if using Inngest Cloud)
INNGEST_SIGNING_KEY=signkey-xxx-xxx-xxx
INNGEST_EVENT_KEY=eventkey-xxx-xxx-xxx
```

### Environment Variable Settings

For each variable:
- **Environment**: Select all (Production, Preview, Development)
- **Value**: Paste your actual API key/value

**Important Notes:**
- `URL` and `NEXT_PUBLIC_URL` should be set to your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
- After adding environment variables, **redeploy** your application for changes to take effect

## Step 4: Configure Inngest for Production

### Option A: Using Inngest Cloud (Recommended)

1. Sign up at [Inngest Cloud](https://www.inngest.com/)
2. Create a new app in Inngest Dashboard
3. Copy your **Signing Key** and **Event Key** from Inngest Dashboard
4. Add them to Vercel environment variables:
   - `INNGEST_SIGNING_KEY`
   - `INNGEST_EVENT_KEY`
5. In Inngest Dashboard, set your **Inngest URL** to: `https://your-app.vercel.app/api/inngest`

### Option B: Self-Hosted Inngest

If you're self-hosting Inngest, you'll need to:
1. Deploy Inngest separately (e.g., on a VPS or another platform)
2. Update your Inngest client configuration to point to your self-hosted instance
3. Configure webhooks accordingly

## Step 5: Update MongoDB Network Access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to **Network Access**
3. Add Vercel's IP ranges or allow access from anywhere (`0.0.0.0/0`) for production
4. **Security Note**: For production, consider using MongoDB Atlas IP Access List with specific IPs

## Step 6: Redeploy with Environment Variables

After adding all environment variables:

1. Go to **Deployments** tab in Vercel Dashboard
2. Click the **"..."** menu on your latest deployment
3. Select **"Redeploy"**
4. Or push a new commit to trigger automatic deployment

## Step 7: Verify Deployment

1. **Check your site**: Visit `https://your-app.vercel.app`
2. **Test API routes**: 
   - `/api/news` - Should return news articles
   - `/api/inngest` - Should be accessible by Inngest
3. **Check Inngest Dashboard**: Verify your functions are registered
4. **Test Inngest functions**: Trigger a test event from Inngest Dashboard

## Step 8: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains** in Vercel Dashboard
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `URL` and `NEXT_PUBLIC_URL` environment variables to your custom domain

## Troubleshooting

### Build Failures

- **Check build logs** in Vercel Dashboard → Deployments → [Your Deployment] → Build Logs
- **Common issues**:
  - Missing environment variables
  - MongoDB connection issues
  - API key authentication failures

### Inngest Not Working

- **Verify environment variables**: Ensure `INNGEST_SIGNING_KEY` and `INNGEST_EVENT_KEY` are set
- **Check Inngest URL**: Ensure it's set to `https://your-app.vercel.app/api/inngest` in Inngest Dashboard
- **Check function registration**: Visit Inngest Dashboard to see if functions are registered
- **Review logs**: Check Vercel function logs for errors

### MongoDB Connection Issues

- **Network Access**: Ensure MongoDB Atlas allows connections from Vercel
- **Connection String**: Verify `MONGODB_URI` is correct and includes database name
- **Check logs**: Review Vercel function logs for connection errors

### API Routes Not Working

- **Check environment variables**: Ensure all API keys are set
- **Verify URLs**: Ensure `URL` and `NEXT_PUBLIC_URL` are set correctly
- **Review function logs**: Check Vercel function logs for errors

## Vercel-Specific Optimizations

### Next.js Configuration

Your `next.config.mjs` is already minimal and production-ready. Vercel automatically optimizes:
- Image optimization
- Static file serving
- Serverless function deployment
- Edge runtime where applicable

### Function Timeout

- Vercel Hobby plan: 10 seconds max execution time
- Vercel Pro plan: 60 seconds max execution time
- For longer-running Inngest functions, ensure they're properly async and don't block

### Environment Variables

- **Build-time variables**: Available during `next build`
- **Runtime variables**: Available during request handling
- **Public variables**: Prefix with `NEXT_PUBLIC_` for client-side access

## Post-Deployment Checklist

- [ ] All environment variables are set in Vercel
- [ ] MongoDB network access allows Vercel IPs
- [ ] Inngest is configured and connected
- [ ] Site is accessible at Vercel URL
- [ ] API routes are working
- [ ] Inngest functions are registered
- [ ] Scheduled functions (cron jobs) are running
- [ ] Custom domain is configured (if applicable)
- [ ] Analytics/monitoring is set up (optional)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Inngest Deployment Guide](https://www.inngest.com/docs/deploy)
- [MongoDB Atlas Connection Guide](https://www.mongodb.com/docs/atlas/connect-to-cluster/)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review Inngest Dashboard for function status
3. Check MongoDB Atlas logs
4. Review application logs in Vercel Dashboard → Functions

