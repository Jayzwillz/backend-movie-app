const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

// Test Review model
const testReviewModel = async () => {
  try {
    const Review = require('./models/Review');
    console.log('\n📝 Testing Review Model...');
    
    // Test creating a review
    const testReview = new Review({
      movieId: 'test-123',
      userId: new mongoose.Types.ObjectId(),
      rating: 5,
      comment: 'Test review for database connectivity',
      movieTitle: 'Test Movie',
      title: 'Great movie!'
    });
    
    console.log('Review object created:', {
      movieId: testReview.movieId,
      rating: testReview.rating,
      comment: testReview.comment
    });
    
    // Validate without saving
    const validationError = testReview.validateSync();
    if (validationError) {
      console.log('❌ Validation failed:', validationError.message);
    } else {
      console.log('✅ Review validation passed');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Review model test failed:', error.message);
    return false;
  }
};

// Main test function
const runTests = async () => {
  console.log('🔍 Testing Backend Components...\n');
  
  // Test 1: MongoDB Connection
  const dbConnected = await connectDB();
  
  if (dbConnected) {
    // Test 2: Review Model
    await testReviewModel();
    
    // Test 3: Environment Variables
    console.log('\n🔧 Environment Variables Check:');
    console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('- PORT:', process.env.PORT || '5000 (default)');
  }
  
  console.log('\n📊 Test Complete');
  process.exit(0);
};

runTests();
