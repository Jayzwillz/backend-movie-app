const { validationResult } = require('express-validator');
const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Add a review for a movie
// @route   POST /api/reviews
// @access  Protected
const addReview = async (req, res) => {
  try {
    console.log('\n🎬 === ADD REVIEW REQUEST ===');
    console.log('User ID:', req.user._id);
    console.log('Request body:', req.body);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { movieId, rating, comment, movieTitle, title } = req.body;
    const userId = req.user._id;

    console.log('Processing review data:', { movieId, rating, comment: comment?.slice(0, 50) + '...', movieTitle, title });

    // Check if user has already reviewed this movie
    const existingReview = await Review.findOne({ userId, movieId });
    if (existingReview) {
      console.log('❌ User has already reviewed this movie:', existingReview._id);
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }

    console.log('✅ No existing review found, creating new review...');

    // Create new review
    const review = await Review.create({
      movieId,
      userId,
      rating,
      comment,
      movieTitle,
      title: title || ''
    });

    console.log('✅ Review created in database:', review._id);
    console.log('Review details:', {
      id: review._id,
      movieId: review.movieId,
      userId: review.userId,
      rating: review.rating
    });

    // Populate user info for the response
    await review.populate('userId', 'name email');
    console.log('✅ User info populated:', review.userId);

    const responseData = {
      message: 'Review added successfully',
      review: {
        _id: review._id,
        movieId: review.movieId,
        movieTitle: review.movieTitle,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        likes: review.likes,
        dislikes: review.dislikes,
        user: {
          _id: review.userId._id,
          username: review.userId.name || review.userId.email.split('@')[0]
        },
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        source: 'user'
      }
    };

    console.log('✅ Sending response:', JSON.stringify(responseData, null, 2));
    res.status(201).json(responseData);

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
    console.log('\n🎬 === GET MOVIE REVIEWS ===');
    console.log('Movie ID:', movieId);
    
    // Get reviews with user info
    const reviews = await Review.find({ movieId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${reviews.length} reviews for movie ${movieId}`);
    if (reviews.length > 0) {
      console.log('Sample review:', {
        id: reviews[0]._id,
        rating: reviews[0].rating,
        comment: reviews[0].comment?.slice(0, 50) + '...'
      });
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    const responseData = {
      movieId,
      totalReviews: reviews.length,
      averageRating: parseFloat(averageRating),
      reviews: reviews.map(review => ({
        _id: review._id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        likes: review.likes,
        dislikes: review.dislikes,
        likedBy: review.likedBy,
        dislikedBy: review.dislikedBy,
        user: {
          _id: review.userId._id,
          username: review.userId.name || review.userId.email.split('@')[0]
        },
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        source: 'user'
      }))
    };

    console.log('✅ Sending response with', responseData.reviews.length, 'reviews');
    res.json(responseData);

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
    const { rating, comment, title } = req.body;

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
    review.title = title !== undefined ? title : review.title;
    await review.save();

    await review.populate('userId', 'name email');

    res.json({
      message: 'Review updated successfully',
      review: {
        id: review._id,
        movieId: review.movieId,
        movieTitle: review.movieTitle,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        likes: review.likes,
        dislikes: review.dislikes,
        user: {
          id: review.userId._id,
          name: review.userId.name || review.userId.email.split('@')[0]
        },
        createdAt: review.createdAt,
        source: 'user'
      }
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like/Dislike a review
// @route   POST /api/reviews/:id/like
// @access  Protected
const likeReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { type } = req.body; // 'like' or 'dislike'
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const hasLiked = review.likedBy.includes(userId);
    const hasDisliked = review.dislikedBy.includes(userId);

    if (type === 'like') {
      if (hasLiked) {
        // Remove like
        review.likedBy = review.likedBy.filter(id => id.toString() !== userId.toString());
        review.likes = Math.max(0, review.likes - 1);
      } else {
        // Add like, remove dislike if exists
        if (hasDisliked) {
          review.dislikedBy = review.dislikedBy.filter(id => id.toString() !== userId.toString());
          review.dislikes = Math.max(0, review.dislikes - 1);
        }
        review.likedBy.push(userId);
        review.likes += 1;
      }
    } else if (type === 'dislike') {
      if (hasDisliked) {
        // Remove dislike
        review.dislikedBy = review.dislikedBy.filter(id => id.toString() !== userId.toString());
        review.dislikes = Math.max(0, review.dislikes - 1);
      } else {
        // Add dislike, remove like if exists
        if (hasLiked) {
          review.likedBy = review.likedBy.filter(id => id.toString() !== userId.toString());
          review.likes = Math.max(0, review.likes - 1);
        }
        review.dislikedBy.push(userId);
        review.dislikes += 1;
      }
    }

    await review.save();

    res.json({
      message: 'Review updated successfully',
      likes: review.likes,
      dislikes: review.dislikes,
      userLiked: review.likedBy.includes(userId),
      userDisliked: review.dislikedBy.includes(userId)
    });

  } catch (error) {
    console.error('Like review error:', error);
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
  deleteReview,
  likeReview
};
