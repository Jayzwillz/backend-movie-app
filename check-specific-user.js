// Check the specific user that was just created
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkSpecificUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check the user that was just created
    const user = await User.findOne({ email: 'jahswill4jah@gmail.com' }).sort({ createdAt: -1 });
    
    if (user) {
      console.log('Found user:');
      console.log('- ID:', user._id);
      console.log('- Name:', user.name);
      console.log('- Email:', user.email);
      console.log('- isVerified:', user.isVerified);
      console.log('- isGoogleUser:', user.isGoogleUser);
      console.log('- Created at:', user.createdAt);
    } else {
      console.log('User not found');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

checkSpecificUser();
