const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  addReview,
  getMovieReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  likeReview
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
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  body('movieTitle')
    .notEmpty()
    .trim()
    .withMessage('Movie title is required'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Review title cannot be more than 100 characters')
];

const updateReviewValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Review title cannot be more than 100 characters')
];

// @route   POST /api/reviews
// @desc    Add a review for a movie
// @access  Protected
router.post('/', protect, reviewValidation, addReview);

// @route   POST /api/reviews/test
// @desc    Test route to verify review creation
// @access  Protected
router.post('/test', protect, (req, res) => {
  console.log('🧪 TEST ROUTE HIT - Review test endpoint');
  console.log('User:', req.user._id);
  console.log('Body:', req.body);
  res.json({ 
    message: 'Test route working!',
    user: req.user._id,
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

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

// @route   POST /api/reviews/:id/like
// @desc    Like or dislike a review
// @access  Protected
router.post('/:id/like', protect, likeReview);

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Protected
router.delete('/:id', protect, deleteReview);

module.exports = router;
