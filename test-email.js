// Test email configuration
require('dotenv').config();
const { sendVerificationEmail, generateVerificationToken } = require('./services/emailService');

const testEmail = async () => {
  console.log('Testing email configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 'Not set');
  console.log('EMAIL_VERIFICATION_SECRET set:', !!process.env.EMAIL_VERIFICATION_SECRET);
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

  try {
    // Generate a test token
    const testToken = generateVerificationToken('test-user-id');
    console.log('Generated test token:', testToken ? 'Success' : 'Failed');

    // Try to send test email
    console.log('\nAttempting to send test email...');
    const emailSent = await sendVerificationEmail(
      'jahswill4jahs@gmail.com', // Send to yourself for testing
      'Test User',
      testToken
    );

    console.log('Email send result:', emailSent ? 'SUCCESS' : 'FAILED');
  } catch (error) {
    console.error('Email test error:', error);
  }
};

testEmail();
