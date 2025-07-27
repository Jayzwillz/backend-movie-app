// Check environment variables
require('dotenv').config();

console.log('Environment Variables Check:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD (length):', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 'Not set');
console.log('EMAIL_PASSWORD (value):', process.env.EMAIL_PASSWORD);
console.log('EMAIL_VERIFICATION_SECRET set:', !!process.env.EMAIL_VERIFICATION_SECRET);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Gmail app passwords should be exactly 16 characters
if (process.env.EMAIL_PASSWORD) {
  console.log('Expected length: 16, Actual length:', process.env.EMAIL_PASSWORD.length);
  console.log('Contains spaces:', process.env.EMAIL_PASSWORD.includes(' '));
}
