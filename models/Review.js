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
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  movieTitle: {
    type: String,
    required: [true, 'Movie title is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
reviewSchema.index({ movieId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true }); // Prevent duplicate reviews

module.exports = mongoose.model('Review', reviewSchema);
