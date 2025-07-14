const { validationResult } = require('express-validator');
const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Protected
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user is accessing their own profile
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. You can only view your own profile.' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        watchlistCount: user.watchlist.length
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PATCH /api/users/:id
// @access  Protected
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user is updating their own profile
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. You can only update your own profile.' });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { name, email } = req.body;
    
    // Check if email is being changed and if it's already in use
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's watchlist
// @route   GET /api/users/:id/watchlist
// @access  Protected
const getUserWatchlist = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user is accessing their own watchlist
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. You can only view your own watchlist.' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      watchlist: user.watchlist.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    });

  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add movie to watchlist
// @route   POST /api/users/:id/watchlist
// @access  Protected
const addToWatchlist = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user is adding to their own watchlist
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own watchlist.' });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { movieId, title, poster, year } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if movie is already in watchlist
    const existingMovie = user.watchlist.find(movie => movie.movieId === movieId);
    if (existingMovie) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    // Add movie to watchlist
    user.watchlist.push({
      movieId,
      title,
      poster,
      year,
      addedAt: new Date()
    });

    await user.save();

    res.status(201).json({
      message: 'Movie added to watchlist successfully',
      watchlist: user.watchlist.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    });

  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove movie from watchlist
// @route   DELETE /api/users/:id/watchlist/:movieId
// @access  Protected
const removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.params.id;
    const movieId = req.params.movieId;
    
    // Check if user is removing from their own watchlist
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own watchlist.' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find and remove movie from watchlist
    const movieIndex = user.watchlist.findIndex(movie => movie.movieId === movieId);
    
    if (movieIndex === -1) {
      return res.status(404).json({ message: 'Movie not found in watchlist' });
    }

    user.watchlist.splice(movieIndex, 1);
    await user.save();

    res.json({
      message: 'Movie removed from watchlist successfully',
      watchlist: user.watchlist.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    });

  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/:id
// @access  Protected
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user is deleting their own account
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own account.' });
    }

    // Find the user first
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all reviews by this user
    await Review.deleteMany({ userId: userId });

    // Delete the user account
    await User.findByIdAndDelete(userId);

    res.json({ 
      message: 'User account deleted successfully. All associated data has been removed.',
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  deleteUser
};
