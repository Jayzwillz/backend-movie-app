const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-app');
    
    console.log('Connected to MongoDB');

    // Admin user details
    const adminData = {
      name: 'Admin User',
      email: 'jahswill4jahs@gmail.com', // Change this to your email
      password: 'J2a4h6s8will!', // Change this to a secure password
      role: 'admin'
    };

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      // Update existing user to admin
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log(`✅ User ${adminData.email} has been promoted to admin`);
    } else {
      // Create new admin user
      const adminUser = await User.create(adminData);
      console.log(`✅ Admin user created successfully:`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Role: ${adminUser.role}`);
    }

    console.log('\n🎉 Admin setup complete!');
    console.log('\nYou can now login with:');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log('\n⚠️  Make sure to change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 11000) {
      console.log('\n💡 Tip: User with this email already exists. Try updating their role manually.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Additional function to promote existing user to admin
const promoteUserToAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-app');
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    user.role = 'admin';
    await user.save();
    
    console.log(`✅ User ${email} has been promoted to admin`);
    
  } catch (error) {
    console.error('❌ Error promoting user:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Check command line arguments
const command = process.argv[2];
const email = process.argv[3];

if (command === 'promote' && email) {
  promoteUserToAdmin(email);
} else {
  createAdminUser();
}
