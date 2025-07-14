const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Protected + Admin
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);
    
    res.json({
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        watchlistCount: user.watchlist.length,
        createdAt: user.createdAt
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete any user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Protected + Admin
const deleteAnyUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user first
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    // Delete all reviews by this user
    const deletedReviews = await Review.deleteMany({ userId: userId });

    // Delete the user account
    await User.findByIdAndDelete(userId);

    res.json({ 
      message: 'User account deleted successfully by admin.',
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email,
        watchlistCount: user.watchlist.length
      },
      deletedReviewsCount: deletedReviews.deletedCount
    });

  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user statistics (Admin only)
// @route   GET /api/admin/stats
// @access  Protected + Admin
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalReviews = await Review.countDocuments();
    
    // Get users registered in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Most active users (by review count)
    const topReviewers = await Review.aggregate([
      { $group: { _id: '$userId', reviewCount: { $sum: 1 } } },
      { $sort: { reviewCount: -1 } },
      { $limit: 5 },
      { 
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          reviewCount: 1,
          userName: '$user.name',
          userEmail: '$user.email'
        }
      }
    ]);

    res.json({
      totalUsers,
      totalAdmins,
      totalReviews,
      recentUsers,
      topReviewers,
      averageReviewsPerUser: totalUsers > 0 ? (totalReviews / totalUsers).toFixed(2) : 0
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Promote user to admin (Admin only)
// @route   PATCH /api/admin/users/:id/promote
// @access  Protected + Admin
const promoteToAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    user.role = 'admin';
    await user.save();

    res.json({ 
      message: 'User promoted to admin successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Promote to admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Demote admin to user (Admin only)
// @route   PATCH /api/admin/users/:id/demote
// @access  Protected + Admin
const demoteToUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'user' || !user.role) {
      return res.status(400).json({ message: 'User is already a regular user' });
    }

    // Prevent self-demotion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot demote yourself' });
    }

    user.role = 'user';
    await user.save();

    res.json({ 
      message: 'Admin demoted to user successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Demote to user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all reviews (Admin only)
// @route   GET /api/admin/reviews
// @access  Protected + Admin
const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments();
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete any review (Admin only)
// @route   DELETE /api/admin/reviews/:id
// @access  Protected + Admin
const deleteAnyReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await Review.findByIdAndDelete(id);

    res.json({ message: 'Review deleted successfully by admin' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  deleteAnyUser,
  getUserStats,
  promoteToAdmin,
  demoteToUser,
  getAllReviews,
  deleteAnyReview
};
