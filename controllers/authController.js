const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { 
  generateVerificationToken, 
  sendVerificationEmail, 
  verifyToken,
  generatePasswordResetToken,
  sendPasswordResetEmail,
  verifyPasswordResetToken
} = require('../services/emailService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    console.log('=== REGISTRATION DEBUG ===');
    console.log('Creating new user:', { name, email });
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      isVerified: false // Require email verification
    });

    console.log('User created in database:');
    console.log('- ID:', user._id);
    console.log('- Email:', user.email);
    console.log('- isVerified:', user.isVerified);
    console.log('- isGoogleUser:', user.isGoogleUser);

    // Immediately fetch from database to double-check
    const dbUser = await User.findById(user._id);
    console.log('User fetched from database:');
    console.log('- isVerified:', dbUser.isVerified);
    console.log('- isGoogleUser:', dbUser.isGoogleUser);

    try {
      // Generate verification token
      console.log('Generating verification token...');
      const verificationToken = generateVerificationToken(user._id);
      console.log('Generated verification token:', verificationToken ? 'Success' : 'Failed');

      // Send verification email
      console.log('Attempting to send verification email...');
      const emailSent = await sendVerificationEmail(user.email, user.name, verificationToken);
      console.log('Email send result:', emailSent);

      if (!emailSent) {
        console.log('Email failed to send but user created');
        return res.status(201).json({
          message: 'User registered successfully, but verification email failed to send. Please contact support or use the resend option.',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || 'user',
            isVerified: user.isVerified,
            createdAt: user.createdAt
          },
          emailSent: false
        });
      }

      console.log('Verification email sent successfully');
      res.status(201).json({
        message: 'User registered successfully. Please check your email to verify your account before logging in.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          isVerified: user.isVerified,
          createdAt: user.createdAt
        },
        emailSent: true
      });

    } catch (emailError) {
      console.error('Email service error:', emailError);
      return res.status(201).json({
        message: 'User registered successfully, but there was an issue sending the verification email. Please try to resend it.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          isVerified: user.isVerified,
          createdAt: user.createdAt
        },
        emailSent: false
      });
    }

  } catch (error) {
    console.error('Register error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified (skip for Google users)
    if (!user.isGoogleUser && !user.isVerified) {
      return res.status(401).json({ 
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        needsVerification: true
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        createdAt: user.createdAt
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Google OAuth login
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not found in Google account' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user with Google info if not already a Google user
      if (!user.isGoogleUser) {
        user.isGoogleUser = true;
        user.googleId = googleId;
        user.avatar = picture || user.avatar;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        avatar: picture || '',
        isGoogleUser: true,
        isVerified: true, // Google users are automatically verified
        googleId,
        // Check if this is admin email and set role accordingly
        role: email === 'jayzwillz@gmail.com' ? 'admin' : 'user'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Google authentication successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role || 'user',
        isGoogleUser: user.isGoogleUser,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error) {
    console.error('Google auth error:', error);
    if (error.message.includes('Token used too early') || error.message.includes('Invalid token')) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }
    res.status(500).json({ message: 'Server error during Google authentication' });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Verify the token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Find user and update verification status
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Update user verification status
    user.isVerified = true;
    await user.save();

    // Redirect to success page on frontend
    res.redirect(`${process.env.FRONTEND_URL}/email-verified?success=true`);

  } catch (error) {
    console.error('Email verification error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/email-verified?success=false&error=server_error`);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    if (user.isGoogleUser) {
      return res.status(400).json({ message: 'Google users do not need email verification' });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken(user._id);

    // Send verification email
    const emailSent = await sendVerificationEmail(user.email, user.name, verificationToken);

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.json({ message: 'Verification email sent successfully' });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error while resending verification email' });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('Password reset requested for email:', email);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    if (user.isGoogleUser) {
      return res.status(400).json({ 
        message: 'Google users cannot reset their password. Please use Google sign-in.' 
      });
    }

    // Generate password reset token
    const resetToken = generatePasswordResetToken(user._id);

    // Save reset token to user (optional: for additional verification)
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    console.log('Password reset token generated for user:', user._id);

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(user.email, user.name, resetToken);

    if (!emailSent) {
      console.error('Failed to send password reset email for user:', user._id);
      return res.status(500).json({ message: 'Failed to send password reset email' });
    }

    console.log('Password reset email sent successfully to:', email);

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error while processing password reset request' });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    console.log('Password reset attempt with token');

    // Verify the reset token
    const decoded = verifyPasswordResetToken(token);
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    console.log('Password reset token verified for user:', decoded.userId);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if token matches and hasn't expired (double verification)
    if (user.passwordResetToken !== token || 
        !user.passwordResetExpires || 
        user.passwordResetExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (user.isGoogleUser) {
      return res.status(400).json({ 
        message: 'Google users cannot reset their password. Please use Google sign-in.' 
      });
    }

    console.log('Updating password for user:', user._id);

    // Update password
    user.password = newPassword; // This will be hashed by the pre-save middleware
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    console.log('Password reset successful for user:', user._id);

    res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error while resetting password' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword
};
