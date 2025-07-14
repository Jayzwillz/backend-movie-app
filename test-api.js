// Test script to verify API endpoints
// You can run this with: node test-api.js

const baseURL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
};

const testMovie = {
  movieId: 'tt1234567',
  title: 'Test Movie',
  poster: 'https://example.com/poster.jpg',
  year: '2023'
};

const testReview = {
  movieId: 'tt1234567',
  movieTitle: 'Test Movie',
  rating: 8,
  comment: 'Great movie! Highly recommended.'
};

async function testAPI() {
  console.log('🚀 Testing Movie App API...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);
    console.log();

    // Test user registration
    console.log('2. Testing user registration...');
    const registerResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ User registered successfully');
      console.log('User:', registerData.user);
      console.log('Token received:', !!registerData.token);
    } else {
      console.log('❌ Registration failed:', registerData.message);
    }
    console.log();

    // Test user login
    console.log('3. Testing user login...');
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ User logged in successfully');
      console.log('Token received:', !!loginData.token);
      
      const token = loginData.token;
      const userId = loginData.user.id;

      // Test protected route - get user profile
      console.log('\n4. Testing protected route - get user profile...');
      const profileResponse = await fetch(`${baseURL}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileResponse.json();
      
      if (profileResponse.ok) {
        console.log('✅ Profile retrieved successfully');
        console.log('User profile:', profileData.user);
      } else {
        console.log('❌ Profile retrieval failed:', profileData.message);
      }

      // Test watchlist - add movie
      console.log('\n5. Testing watchlist - add movie...');
      const addWatchlistResponse = await fetch(`${baseURL}/users/${userId}/watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testMovie)
      });
      const addWatchlistData = await addWatchlistResponse.json();
      
      if (addWatchlistResponse.ok) {
        console.log('✅ Movie added to watchlist successfully');
        console.log('Watchlist length:', addWatchlistData.watchlist.length);
      } else {
        console.log('❌ Add to watchlist failed:', addWatchlistData.message);
      }

      // Test reviews - add review
      console.log('\n6. Testing reviews - add review...');
      const addReviewResponse = await fetch(`${baseURL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testReview)
      });
      const addReviewData = await addReviewResponse.json();
      
      if (addReviewResponse.ok) {
        console.log('✅ Review added successfully');
        console.log('Review:', addReviewData.review);
      } else {
        console.log('❌ Add review failed:', addReviewData.message);
      }

      // Test get movie reviews
      console.log('\n7. Testing get movie reviews...');
      const getReviewsResponse = await fetch(`${baseURL}/reviews/${testReview.movieId}`);
      const getReviewsData = await getReviewsResponse.json();
      
      if (getReviewsResponse.ok) {
        console.log('✅ Movie reviews retrieved successfully');
        console.log('Total reviews:', getReviewsData.totalReviews);
        console.log('Average rating:', getReviewsData.averageRating);
      } else {
        console.log('❌ Get reviews failed:', getReviewsData.message);
      }

    } else {
      console.log('❌ Login failed:', loginData.message);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🎉 API testing completed!');
}

// Note: This test script requires the fetch API (Node.js 18+) or you can install node-fetch
// For now, you can test the endpoints manually using a tool like Postman or Thunder Client

console.log('📝 API Test Script');
console.log('To run this test, make sure:');
console.log('1. MongoDB is running');
console.log('2. Backend server is running on port 5000');
console.log('3. You have Node.js 18+ (for fetch API) or install node-fetch');
console.log('');
console.log('Example API calls:');
console.log('POST http://localhost:5000/api/auth/register');
console.log('POST http://localhost:5000/api/auth/login');
console.log('GET http://localhost:5000/api/users/:id (with Bearer token)');
console.log('POST http://localhost:5000/api/users/:id/watchlist (with Bearer token)');
console.log('POST http://localhost:5000/api/reviews (with Bearer token)');
console.log('GET http://localhost:5000/api/reviews/:movieId');

// Uncomment the line below to run the test (requires Node.js 18+ or node-fetch)
// testAPI();
