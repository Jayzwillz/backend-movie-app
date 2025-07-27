// Migration script to set existing users as verified
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const migrateExistingUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all existing users to be verified
    const result = await User.updateMany(
      { isVerified: { $ne: true } },
      { $set: { isVerified: true } }
    );

    console.log(`Updated ${result.modifiedCount} users to verified status`);
    
    // List all users and their verification status
    const users = await User.find({}, 'name email isVerified isGoogleUser');
    console.log('\nAll users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}): verified=${user.isVerified}, google=${user.isGoogleUser}`);
    });

    await mongoose.connection.close();
    console.log('\nMigration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  }
};

migrateExistingUsers();
