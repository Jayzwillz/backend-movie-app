const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Review = require('../models/Review');

// Test Gemini AI connection
router.get('/test', async (req, res) => {
  try {
    const result = await geminiService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('AI Test Error:', error);
    res.status(500).json({
      success: false,
      message: 'AI service test failed',
      error: error.message
    });
  }
});

// AI Movie Recommendations
router.post('/recommendations', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme, count = 10 } = req.body;

    // Get user profile data
    const user = await User.findById(userId).populate('watchlist');
    const userReviews = await Review.find({ user: userId }).populate('movieId');

    // Build user profile for AI
    const userProfile = {
      watchlist: user.watchlist || [],
      ratings: userReviews.map(review => ({
        movieTitle: review.movieTitle,
        rating: review.rating,
        comment: review.comment
      })),
      preferences: {
        genres: user.preferredGenres || [],
        favoriteActors: user.favoriteActors || [],
        favoriteDirectors: user.favoriteDirectors || []
      },
      theme
    };

    console.log('Generating AI recommendations for user:', userId);
    const recommendations = await geminiService.generateRecommendations(userProfile, { count });

    res.json({
      success: true,
      recommendations: recommendations.recommendations,
      analysis: recommendations.analysis,
      themed_collection: recommendations.themed_collection,
      user_profile_summary: {
        watchlist_count: userProfile.watchlist.length,
        reviews_count: userProfile.ratings.length,
        theme: theme || 'Personalized'
      }
    });

  } catch (error) {
    console.error('AI Recommendations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Intelligent Natural Language Search
router.post('/search', protect, async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user.id;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Get user context for better search
    const user = await User.findById(userId);
    const userContext = {
      preferredGenres: user.preferredGenres || [],
      watchHistory: user.watchlist || []
    };

    console.log('AI analyzing search query:', query);
    const searchAnalysis = await geminiService.analyzeNaturalLanguageQuery(query, userContext);

    res.json({
      success: true,
      query: query,
      interpretation: searchAnalysis.interpretation,
      search_parameters: searchAnalysis.search_parameters,
      movie_suggestions: searchAnalysis.movie_suggestions,
      search_tips: searchAnalysis.search_tips
    });

  } catch (error) {
    console.error('AI Search Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze search query',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// AI Review Analysis & Summary
router.post('/analyze-reviews/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    const { movieTitle, tmdbReviews = [] } = req.body;

    // Get user reviews from database
    const userReviews = await Review.find({ movieId }).populate('user', 'name');

    // Combine TMDB and user reviews
    const allReviews = [
      ...tmdbReviews.map(review => ({
        content: review.content,
        rating: review.author_details?.rating,
        author: review.author,
        source: 'tmdb'
      })),
      ...userReviews.map(review => ({
        content: review.comment,
        rating: review.rating,
        author: review.user.name,
        source: 'user'
      }))
    ];

    if (allReviews.length === 0) {
      return res.json({
        success: true,
        message: 'No reviews available for analysis',
        analysis: null
      });
    }

    console.log(`AI analyzing ${allReviews.length} reviews for movie:`, movieTitle);
    const analysis = await geminiService.analyzeReviews(allReviews, movieTitle);

    res.json({
      success: true,
      movie_title: movieTitle,
      reviews_analyzed: allReviews.length,
      analysis: analysis,
      review_sources: {
        tmdb_reviews: tmdbReviews.length,
        user_reviews: userReviews.length
      }
    });

  } catch (error) {
    console.error('AI Review Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Smart Movie Chatbot
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, movieTitle, conversationHistory = [] } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Chat message is required'
      });
    }

    // Get user profile for context
    const user = await User.findById(userId);
    const userProfile = {
      preferredGenres: user.preferredGenres || [],
      watchlist: user.watchlist || []
    };

    const context = {
      movieTitle,
      userProfile,
      conversationHistory
    };

    console.log('AI chatbot responding to:', message);
    const chatResponse = await geminiService.chatWithUser(message, context);

    res.json({
      success: true,
      message: message,
      response: chatResponse.response,
      timestamp: chatResponse.timestamp,
      context: {
        movie_title: movieTitle,
        has_user_context: !!userProfile
      }
    });

  } catch (error) {
    console.error('AI Chatbot Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate chat response',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// AI Movie Plot & Theme Analysis
router.post('/analyze-movie', async (req, res) => {
  try {
    const { movieData } = req.body;

    if (!movieData || !movieData.title) {
      return res.status(400).json({
        success: false,
        message: 'Movie data is required'
      });
    }

    console.log('AI analyzing movie themes and plot for:', movieData.title);
    const analysis = await geminiService.analyzeMoviePlotAndThemes(movieData);

    res.json({
      success: true,
      movie_title: movieData.title,
      analysis: analysis
    });

  } catch (error) {
    console.error('AI Movie Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze movie',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Personalized Movie News & Updates
router.get('/news', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user preferences
    const user = await User.findById(userId).populate('watchlist');
    const userReviews = await Review.find({ user: userId });

    const userPreferences = {
      watchlist: user.watchlist?.map(movie => movie.title) || [],
      favoriteGenres: user.preferredGenres || [],
      ratedMovies: userReviews.map(review => ({
        title: review.movieTitle,
        rating: review.rating
      }))
    };

    // You could add trending movie data here from TMDB
    const movieTrends = []; // This could be populated with current trending movies

    console.log('AI generating personalized news for user:', userId);
    const news = await geminiService.generatePersonalizedNews(userPreferences, movieTrends);

    res.json({
      success: true,
      user_id: userId,
      personalized_news: news,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI News Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate personalized news',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Batch AI operations for development/testing
router.post('/batch-test', protect, async (req, res) => {
  try {
    const results = {};

    // Test all AI features quickly
    results.connection = await geminiService.testConnection();
    
    // Test with sample data
    const sampleMovie = {
      title: "Inception",
      overview: "A thief who steals corporate secrets through the use of dream-sharing technology",
      genre_names: ["Action", "Sci-Fi", "Thriller"],
      release_date: "2010-07-16",
      vote_average: 8.8,
      runtime: 148
    };

    results.movieAnalysis = await geminiService.analyzeMoviePlotAndThemes(sampleMovie);
    
    res.json({
      success: true,
      message: 'Batch AI test completed',
      results
    });

  } catch (error) {
    console.error('Batch AI Test Error:', error);
    res.status(500).json({
      success: false,
      message: 'Batch AI test failed',
      error: error.message
    });
  }
});

module.exports = router;
