// Test script for password reset functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

// Test forgot password endpoint
async function testForgotPassword() {
  try {
    console.log('Testing forgot password endpoint...');
    const response = await axios.post(`${BASE_URL}/forgot-password`, {
      email: 'test@example.com'
    });
    console.log('✅ Forgot password response:', response.data);
  } catch (error) {
    console.log('❌ Forgot password error:', error.response?.data || error.message);
  }
}

// Test reset password endpoint
async function testResetPassword() {
  try {
    console.log('Testing reset password endpoint...');
    const response = await axios.post(`${BASE_URL}/reset-password`, {
      token: 'fake-token-for-testing',
      newPassword: 'newpassword123'
    });
    console.log('✅ Reset password response:', response.data);
  } catch (error) {
    console.log('❌ Reset password error:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Testing Password Reset API Endpoints\n');
  
  await testForgotPassword();
  console.log('');
  await testResetPassword();
  
  console.log('\n🎯 Test completed!');
}

// Only run if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testForgotPassword, testResetPassword };
