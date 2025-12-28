import mongoose from 'mongoose';

const newsArticleSchema = new mongoose.Schema(
  {
    // Unique identifier from RapidAPI (or generated if not available)
    articleId: {
      type: String,
      required: true,
      unique: true, // unique: true automatically creates an index
    },
    // Article title
    articleTitle: {
      plainText: {
        type: String,
        required: true,
      },
    },
    // Article text/content
    text: {
      plainText: {
        type: String,
        default: '',
      },
    },
    // Article image
    image: {
      url: {
        type: String,
        default: null,
      },
    },
    // Author/byline
    byline: {
      type: String,
      default: null,
    },
    // Publication date
    date: {
      type: Date,
      default: null,
    },
    // External URL to full article
    externalUrl: {
      type: String,
      default: null,
    },
    // Category (MOVIE, TV, etc.)
    category: {
      type: String,
      default: 'MOVIE',
      index: true,
    },
    // Country code
    country: {
      type: String,
      default: 'US',
    },
    // Language code
    language: {
      type: String,
      default: 'en-US',
    },
    // Full raw data from RapidAPI for reference
    rawData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Last fetched from RapidAPI timestamp
    lastFetched: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
newsArticleSchema.index({ category: 1, createdAt: -1 });
// Note: articleId already has an index from unique: true, so we don't need to add it again

const NewsArticle =
  mongoose.models.NewsArticle ||
  mongoose.model('NewsArticle', newsArticleSchema);

export default NewsArticle;

