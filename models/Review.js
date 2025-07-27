const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  movieId: {
    type: String,
    required: [true, 'Movie ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot be more than 10']
  },
  title: {
    type: String,
    maxlength: [100, 'Review title cannot be more than 100 characters'],
    trim: true
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    maxlength: [1000, 'Comment cannot be more than 1000 characters'],
    trim: true
  },
  movieTitle: {
    type: String,
    required: [true, 'Movie title is required']
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  helpful: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient querying
reviewSchema.index({ movieId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true }); // Prevent duplicate reviews
reviewSchema.index({ likes: -1 }); // For sorting by most helpful

module.exports = mongoose.model('Review', reviewSchema);
