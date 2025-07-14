const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  addReview,
  getMovieReviews,
  getUserReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

const router = express.Router();

// Validation rules
const reviewValidation = [
  body('movieId')
    .notEmpty()
    .withMessage('Movie ID is required'),
  body('rating')
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('comment')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  body('movieTitle')
    .notEmpty()
    .trim()
    .withMessage('Movie title is required')
];

const updateReviewValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
];

// @route   POST /api/reviews
// @desc    Add a review for a movie
// @access  Protected
router.post('/', protect, reviewValidation, addReview);

// @route   GET /api/reviews/:movieId
// @desc    Get all reviews for a specific movie
// @access  Public
router.get('/:movieId', getMovieReviews);

// @route   GET /api/reviews/user/:userId
// @desc    Get user's reviews
// @access  Protected
router.get('/user/:userId', protect, getUserReviews);

// @route   PATCH /api/reviews/:id
// @desc    Update a review
// @access  Protected
router.patch('/:id', protect, updateReviewValidation, updateReview);

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Protected
router.delete('/:id', protect, deleteReview);

module.exports = router;
