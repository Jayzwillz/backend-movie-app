const express = require('express');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const {
  getAllUsers,
  deleteAnyUser,
  getUserStats,
  promoteToAdmin,
  demoteToUser,
  getAllReviews,
  deleteAnyReview
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(protect);
router.use(isAdmin);

// User management routes
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteAnyUser);
router.patch('/users/:id/promote', promoteToAdmin);
router.patch('/users/:id/demote', demoteToUser);

// Review management routes
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteAnyReview);

// Statistics route
router.get('/stats', getUserStats);

module.exports = router;
