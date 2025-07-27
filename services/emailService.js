const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Create transporter
const createTransporter = () => {
  try {
    console.log('Creating email transporter...');
    console.log('Email user:', process.env.EMAIL_USER);
    console.log('Password length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 'Not set');
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      debug: true, // Enable debug output
      logger: true // Log to console
    });
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw error;
  }
};

// Generate verification token
const generateVerificationToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.EMAIL_VERIFICATION_SECRET,
    { expiresIn: '24h' }
  );
};

// Generate password reset token
const generatePasswordResetToken = (userId) => {
  return jwt.sign(
    { userId, type: 'password-reset' },
    process.env.EMAIL_VERIFICATION_SECRET,
    { expiresIn: '1h' } // Password reset tokens expire in 1 hour
  );
};

// Verify password reset token
const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
    if (decoded.type === 'password-reset') {
      return decoded;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Verify email verification token (original function)
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
  } catch (error) {
    return null;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, token) => {
  try {
    // Check if required environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Email credentials not configured');
      return false;
    }

    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: {
        name: 'XZMovies',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Reset Your XZMovies Password',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">XZMovies</h1>
            <p style="color: #6B7280; margin: 5px 0;">Your Ultimate Movie Destination</p>
          </div>
          
          <div style="background: #F9FAFB; padding: 30px; border-radius: 8px; border: 1px solid #E5E7EB;">
            <h2 style="color: #1F2937; margin-top: 0;">Password Reset Request</h2>
            
            <p style="color: #4B5563; line-height: 1.6;">
              Hello ${name},
            </p>
            
            <p style="color: #4B5563; line-height: 1.6;">
              We received a request to reset your password for your XZMovies account. If you didn't make this request, 
              you can safely ignore this email.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #EF4444; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset My Password
              </a>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin-bottom: 10px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #3B82F6; word-break: break-all; font-size: 14px;">
              ${resetUrl}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
              <p style="color: #6B7280; font-size: 14px; margin: 0;">
                <strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.
              </p>
              <p style="color: #6B7280; font-size: 14px; margin: 10px 0 0 0;">
                If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9CA3AF; font-size: 12px;">
            <p>© 2025 XZMovies. All rights reserved.</p>
          </div>
        </div>
      `
    };

    console.log('Sending password reset email to:', email);
    console.log('Reset URL:', resetUrl);
    
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending password reset email:');
    console.error('- Error message:', error.message);
    console.error('- Error code:', error.code);
    return false;
  }
};

// Send verification email
const sendVerificationEmail = async (email, name, token) => {
  try {
    // Check if required environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Email credentials not configured');
      return false;
    }

    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;
    
    const mailOptions = {
      from: {
        name: 'XZMovies',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Verify Your XZMovies Account',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">XZMovies</h1>
            <p style="color: #6B7280; margin: 5px 0;">Your Ultimate Movie Destination</p>
          </div>
          
          <div style="background: #F9FAFB; padding: 30px; border-radius: 8px; border: 1px solid #E5E7EB;">
            <h2 style="color: #1F2937; margin-top: 0;">Welcome to XZMovies, ${name}!</h2>
            
            <p style="color: #4B5563; line-height: 1.6;">
              Thank you for signing up! To complete your registration and start exploring amazing movies, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 6px; font-weight: bold; display: inline-block;">
                Verify My Email
              </a>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin-bottom: 10px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #3B82F6; word-break: break-all; font-size: 14px;">
              ${verificationUrl}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
              <p style="color: #6B7280; font-size: 14px; margin: 0;">
                <strong>Important:</strong> This verification link will expire in 24 hours for security reasons.
              </p>
              <p style="color: #6B7280; font-size: 14px; margin: 10px 0 0 0;">
                If you didn't create an account with XZMovies, please ignore this email.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9CA3AF; font-size: 12px;">
            <p>© 2025 XZMovies. All rights reserved.</p>
          </div>
        </div>
      `
    };

    console.log('Sending email to:', email);
    console.log('From:', process.env.EMAIL_USER);
    console.log('Verification URL:', verificationUrl);
    
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending verification email:');
    console.error('- Error message:', error.message);
    console.error('- Error code:', error.code);
    console.error('- Full error:', error);
    return false;
  }
};

module.exports = {
  generateVerificationToken,
  verifyToken,
  sendVerificationEmail,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  sendPasswordResetEmail
};
