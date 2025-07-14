const User = require('../models/User');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    // Get user with role field
    const user = await User.findById(req.user._id).select('+role');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      // Fallback: Check if user email is in admin list for backward compatibility
      const adminEmails = [
        'admin@xzmovies.com',
        'jayzwillz@admin.com',
        'jahswill4jahs@gmail.com' // Add your email here
      ];

      if (!adminEmails.includes(user.email)) {
        return res.status(403).json({ 
          message: 'Access denied. Admin privileges required.' 
        });
      }
      
      // If email is in admin list but role is not admin, update the role
      user.role = 'admin';
      await user.save();
      console.log(`🎉 User ${user.email} automatically promoted to admin`);
    }

    // Add role to req.user for use in controllers
    req.user.role = user.role;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { isAdmin };
