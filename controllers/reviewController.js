const { validationResult } = require('express-validator');
const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Add a review for a movie
// @route   POST /api/reviews
// @access  Protected
const addReview = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { movieId, rating, comment, movieTitle } = req.body;
    const userId = req.user._id;

    // Check if user has already reviewed this movie
    const existingReview = await Review.findOne({ userId, movieId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }

    // Create new review
    const review = await Review.create({
      movieId,
      userId,
      rating,
      comment,
      movieTitle
    });

    // Populate user info for the response
    await review.populate('userId', 'name');

    res.status(201).json({
      message: 'Review added successfully',
      review: {
        id: review._id,
        movieId: review.movieId,
        movieTitle: review.movieTitle,
        rating: review.rating,
        comment: review.comment,
        user: {
          id: review.userId._id,
          name: review.userId.name
        },
        createdAt: review.createdAt
      }
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all reviews for a specific movie
// @route   GET /api/reviews/:movieId
// @access  Public
const getMovieReviews = async (req, res) => {
  try {
    const movieId = req.params.movieId;
    
    // Get reviews with user info
    const reviews = await Review.find({ movieId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.json({
      movieId,
      totalReviews: reviews.length,
      averageRating: parseFloat(averageRating),
      reviews: reviews.map(review => ({
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        user: {
          id: review.userId._id,
          name: review.userId.name
        },
        createdAt: review.createdAt
      }))
    });

  } catch (error) {
    console.error('Get movie reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/user/:userId
// @access  Protected
const getUserReviews = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user is accessing their own reviews
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. You can only view your own reviews.' });
    }

    const reviews = await Review.find({ userId })
      .sort({ createdAt: -1 });

    res.json({
      totalReviews: reviews.length,
      reviews: reviews.map(review => ({
        id: review._id,
        movieId: review.movieId,
        movieTitle: review.movieTitle,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      }))
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a review
// @route   PATCH /api/reviews/:id
// @access  Protected
const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation error',
        errors: errors.array()
      });
    }

    // Find review and check ownership
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only update your own reviews.' });
    }

    // Update review
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    await review.populate('userId', 'name');

    res.json({
      message: 'Review updated successfully',
      review: {
        id: review._id,
        movieId: review.movieId,
        movieTitle: review.movieTitle,
        rating: review.rating,
        comment: review.comment,
        user: {
          id: review.userId._id,
          name: review.userId.name
        },
        createdAt: review.createdAt
      }
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Protected
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    // Find review and check ownership
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own reviews.' });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({ message: 'Review deleted successfully' });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addReview,
  getMovieReviews,
  getUserReviews,
  updateReview,
  deleteReview
};
