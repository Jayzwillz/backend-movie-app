require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiConnection() {
  try {
    console.log('🤖 Testing Gemini AI Connection...');
    console.log('API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = 'Say "Hello from XZMovies! Gemini AI is working perfectly!" if you can read this message.';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ SUCCESS! Gemini AI Response:');
    console.log(text);
    
    // Test movie recommendation
    console.log('\n🎬 Testing Movie Recommendation...');
    const moviePrompt = `Recommend 3 popular movies similar to "The Dark Knight" and explain why in JSON format:
    {
      "recommendations": [
        {
          "title": "Movie Title",
          "year": 2023,
          "explanation": "Why similar to The Dark Knight"
        }
      ]
    }`;
    
    const movieResult = await model.generateContent(moviePrompt);
    const movieResponse = await movieResult.response;
    const movieText = movieResponse.text();
    
    console.log('🎯 Movie Recommendation Response:');
    console.log(movieText);
    
  } catch (error) {
    console.error('❌ FAILED! Gemini AI Connection Error:');
    console.error('Error details:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('🔑 API Key is invalid. Please check your Gemini API key.');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.error('🚫 Permission denied. Make sure your API key has proper permissions.');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.error('📊 Quota exceeded. Check your Gemini API usage limits.');
    }
  }
}

testGeminiConnection();
