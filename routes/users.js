const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getUserProfile,
  updateUserProfile,
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const addToWatchlistValidation = [
  body('movieId')
    .notEmpty()
    .withMessage('Movie ID is required'),
  body('title')
    .notEmpty()
    .trim()
    .withMessage('Movie title is required'),
  body('poster')
    .optional()
    .trim(),
  body('year')
    .optional()
    .trim()
];

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Protected
router.get('/:id', protect, getUserProfile);

// @route   PATCH /api/users/:id
// @desc    Update user profile
// @access  Protected
router.patch('/:id', protect, updateProfileValidation, updateUserProfile);

// @route   GET /api/users/:id/watchlist
// @desc    Get user's watchlist
// @access  Protected
router.get('/:id/watchlist', protect, getUserWatchlist);

// @route   POST /api/users/:id/watchlist
// @desc    Add movie to watchlist
// @access  Protected
router.post('/:id/watchlist', protect, addToWatchlistValidation, addToWatchlist);

// @route   DELETE /api/users/:id/watchlist/:movieId
// @desc    Remove movie from watchlist
// @access  Protected
router.delete('/:id/watchlist/:movieId', protect, removeFromWatchlist);

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Protected
router.delete('/:id', protect, deleteUser);

module.exports = router;
