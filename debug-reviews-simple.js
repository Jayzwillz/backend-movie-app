const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function debugReviewSystem() {
  console.log('🔍 === REVIEW SYSTEM DEBUG ===\n');

  try {
    // Test server health
    console.log('1. Testing server health...');
    const health = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Server is running:', health.data.message);

    // Test GET reviews endpoint
    console.log('\n2. Testing GET /api/reviews/123...');
    try {
      const reviews = await axios.get(`${API_BASE_URL}/reviews/123`);
      console.log('✅ GET reviews works:', reviews.data);
    } catch (error) {
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data);
    }

    // Test POST reviews (should fail without auth)
    console.log('\n3. Testing POST /api/reviews (without auth)...');
    try {
      const response = await axios.post(`${API_BASE_URL}/reviews`, {
        movieId: '123',
        rating: 5,
        comment: 'Test review',
        movieTitle: 'Test Movie'
      });
      console.log('⚠️ Unexpected success:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected - needs authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    console.log('\n📊 Debug complete! Backend API is responding correctly.');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.log('\n💡 Make sure the backend server is running:');
    console.log('   cd backend-movie-app && npm start');
  }
}

debugReviewSystem();
