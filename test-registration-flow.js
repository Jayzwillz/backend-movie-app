// Test the exact registration flow
require('dotenv').config();
const { generateVerificationToken, sendVerificationEmail } = require('./services/emailService');

const testRegistrationFlow = async () => {
  console.log('=== Testing Registration Email Flow ===');
  
  try {
    // Simulate the exact steps from registration
    console.log('1. User creation would happen here...');
    
    // Generate verification token (like in registration)
    console.log('2. Generating verification token...');
    const testUserId = 'test-user-id-12345';
    const verificationToken = generateVerificationToken(testUserId);
    console.log('   Token generated:', verificationToken ? 'Success' : 'Failed');
    
    // Send verification email (like in registration)
    console.log('3. Attempting to send verification email...');
    const emailSent = await sendVerificationEmail(
      'jahswill4jahs@gmail.com', // Your email
      'Test Registration User',
      verificationToken
    );
    
    console.log('4. Email send result:', emailSent ? 'SUCCESS' : 'FAILED');
    
    if (emailSent) {
      console.log('✅ Registration email flow is working correctly');
      console.log('📧 Check your email for the verification link');
    } else {
      console.log('❌ Email sending failed in registration flow');
    }
    
  } catch (error) {
    console.error('Registration flow test error:', error);
  }
};

testRegistrationFlow();
