// Debug user creation
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const debugUserCreation = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test user creation exactly like in registration
    console.log('Creating test user...');
    const testUser = await User.create({
      name: 'Debug Test User',
      email: 'debug-test@example.com',
      password: 'password123',
      isVerified: false
    });

    console.log('Created user:');
    console.log('- ID:', testUser._id);
    console.log('- Name:', testUser.name);
    console.log('- Email:', testUser.email);
    console.log('- isVerified:', testUser.isVerified);
    console.log('- isGoogleUser:', testUser.isGoogleUser);

    // Also check what's in the database
    const dbUser = await User.findById(testUser._id);
    console.log('\nUser from database:');
    console.log('- isVerified:', dbUser.isVerified);
    console.log('- isGoogleUser:', dbUser.isGoogleUser);

    // Clean up
    await User.findByIdAndDelete(testUser._id);
    console.log('\nTest user deleted');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Debug error:', error);
  }
};

debugUserCreation();
