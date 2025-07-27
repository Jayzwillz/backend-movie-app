const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection options (removed deprecated options)
    const options = {
      // No deprecated options needed for MongoDB Driver 4.0+
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('');
    console.error('🔧 SOLUTIONS:');
    console.error('1. Check if MongoDB is running locally (if using local MongoDB)');
    console.error('2. Verify MONGODB_URI in your .env file');
    console.error('3. Consider using MongoDB Atlas (cloud) - see DATABASE_SETUP.md');
    console.error('');
    
    // Exit process with failure
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

module.exports = connectDB;
