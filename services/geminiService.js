const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // AI Movie Recommendations Engine
  async generateRecommendations(userProfile, options = {}) {
    try {
      const { watchlist = [], ratings = [], preferences = {}, theme = null } = userProfile;
      const { count = 10 } = options;

      let prompt = `As a movie expert, analyze this user's profile and generate ${count} personalized movie recommendations.

User Profile:
- Watchlist: ${JSON.stringify(watchlist.slice(0, 20))}
- Ratings: ${JSON.stringify(ratings.slice(0, 20))}
- Preferences: ${JSON.stringify(preferences)}`;

      if (theme) {
        prompt += `\n- Theme Request: "${theme}"`;
      }

      prompt += `

Please provide recommendations in this exact JSON format:
{
  "recommendations": [
    {
      "title": "Movie Title",
      "year": 2023,
      "explanation": "Detailed explanation of why this user would enjoy this movie based on their profile",
      "confidence": 85,
      "themes": ["theme1", "theme2"],
      "mood": "exciting/relaxing/emotional/etc",
      "reasoning": "Specific reasoning based on their watchlist and ratings"
    }
  ],
  "analysis": "Brief analysis of the user's movie preferences",
  "themed_collection": {
    "title": "${theme || 'Personalized Picks'}",
    "description": "Description of this collection"
  }
}

Ensure all movies are real and popular. Provide confidence scores between 70-95. Be specific about why each movie matches their taste.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Clean up the response to ensure valid JSON
      const cleanedResponse = this.cleanJsonResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Gemini Recommendations Error:', error);
      throw new Error('Failed to generate AI recommendations');
    }
  }

  // Intelligent Movie Search Assistant
  async analyzeNaturalLanguageQuery(query, userContext = {}) {
    try {
      const prompt = `Convert this natural language movie search query into structured search parameters and provide movie recommendations.

User Query: "${query}"
User Context: ${JSON.stringify(userContext)}

Analyze the query and provide response in this JSON format:
{
  "interpretation": "What the user is looking for",
  "search_parameters": {
    "genres": [],
    "year_range": {"min": null, "max": null},
    "rating_range": {"min": null, "max": null},
    "themes": [],
    "mood": "",
    "similar_to": [],
    "keywords": [],
    "exclude": []
  },
  "movie_suggestions": [
    {
      "title": "Movie Title",
      "year": 2023,
      "match_reason": "Why this matches the query",
      "confidence": 90
    }
  ],
  "search_tips": "Tips for refining the search"
}

Examples of what to extract:
- "like Avengers but more emotional" → similar_to: ["Avengers"], themes: ["emotional", "superhero"]
- "90s sci-fi with strong female leads" → year_range: {"min": 1990, "max": 1999}, genres: ["Science Fiction"], themes: ["strong female protagonist"]
- "feel-good movies for after a breakup" → mood: "feel-good", themes: ["healing", "uplifting", "romance"], exclude: ["sad", "tragic"]
- "mind-bending thrillers like Christopher Nolan" → genres: ["Thriller"], themes: ["mind-bending", "complex plot"], similar_to: ["Inception", "Interstellar", "The Dark Knight"]`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const cleanedResponse = this.cleanJsonResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Gemini Search Analysis Error:', error);
      throw new Error('Failed to analyze search query');
    }
  }

  // AI-Powered Review Analysis & Summary
  async analyzeReviews(reviews, movieTitle) {
    try {
      if (!reviews || reviews.length === 0) {
        return {
          overall_sentiment: { score: 0, label: "No Reviews", explanation: "No reviews available for analysis" },
          summary: "No reviews to analyze",
          pros: [],
          cons: [],
          key_themes: [],
          target_audience: { primary: "Unknown", secondary: "Unknown", avoid_if: "Unknown" },
          critics_vs_audience: "No data available",
          recommendation: "No reviews available for recommendation",
          confidence: 0
        };
      }

      const reviewTexts = reviews.map(r => ({
        text: r.content || r.comment,
        rating: r.rating || r.author_details?.rating,
        author: r.author || r.user?.name
      })).filter(r => r.text && r.text.trim().length > 0).slice(0, 30); // Limit to 30 reviews and filter empty content

      if (reviewTexts.length === 0) {
        return {
          overall_sentiment: { score: 0, label: "No Content", explanation: "No review content available for analysis" },
          summary: "No meaningful review content to analyze",
          pros: [],
          cons: [],
          key_themes: [],
          target_audience: { primary: "Unknown", secondary: "Unknown", avoid_if: "Unknown" },
          critics_vs_audience: "No data available",
          recommendation: "No content available for recommendation",
          confidence: 0
        };
      }

      const prompt = `Analyze these movie reviews for "${movieTitle}" and provide comprehensive insights.

Reviews Data: ${JSON.stringify(reviewTexts)}

Provide analysis in this exact JSON format (no additional text):
{
  "overall_sentiment": {
    "score": 7.5,
    "label": "Positive",
    "explanation": "Overall sentiment explanation"
  },
  "summary": "2-3 sentence summary of all reviews",
  "pros": ["List of main positive points"],
  "cons": ["List of main criticisms"],
  "key_themes": ["themes mentioned in reviews"],
  "target_audience": {
    "primary": "Who would love this movie",
    "secondary": "Who might also enjoy it",
    "avoid_if": "Who should probably skip it"
  },
  "critics_vs_audience": "Comparison if both types of reviews present",
  "recommendation": "Final recommendation based on reviews",
  "confidence": 85
}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      console.log('Raw Gemini response for reviews:', response.substring(0, 200) + '...');
      
      const cleanedResponse = this.cleanJsonResponse(response);
      const parsedResponse = JSON.parse(cleanedResponse);
      
      console.log('Successfully parsed review analysis');
      return parsedResponse;
    } catch (error) {
      console.error('Gemini Review Analysis Error:', error);
      console.error('Error details:', error.message);
      
      // Return a fallback response instead of throwing
      return {
        overall_sentiment: { score: 5, label: "Analysis Failed", explanation: "Unable to analyze reviews at this time" },
        summary: "Review analysis temporarily unavailable",
        pros: ["Analysis temporarily unavailable"],
        cons: ["Analysis temporarily unavailable"],
        key_themes: ["Unable to determine themes"],
        target_audience: { primary: "All audiences", secondary: "Movie lovers", avoid_if: "None specified" },
        critics_vs_audience: "Analysis unavailable",
        recommendation: "Please check individual reviews for detailed opinions",
        confidence: 0,
        error: true
      };
    }
  }

  // Smart Movie Chatbot Assistant
  async chatWithUser(message, context = {}) {
    try {
      const { movieTitle, userProfile, conversationHistory = [] } = context;

      let systemContext = `You are an expert movie assistant for XZMovies app. You're knowledgeable about movies, actors, directors, and can provide recommendations, trivia, and insights.

Current Context:
- Movie being discussed: ${movieTitle || 'General movie discussion'}
- User profile: ${JSON.stringify(userProfile || {})}
- Conversation history: ${JSON.stringify(conversationHistory.slice(-5))}

User message: "${message}"

Respond in a helpful, engaging way. You can:
- Answer questions about movies, actors, directors
- Provide movie recommendations
- Share interesting trivia and behind-the-scenes facts
- Help users decide what to watch
- Explain movie plots, themes, or symbolism
- Discuss movie history and cultural impact

Keep responses conversational but informative, around 2-3 paragraphs maximum.`;

      const result = await this.model.generateContent(systemContext);
      return {
        response: result.response.text(),
        timestamp: new Date().toISOString(),
        context: context
      };
    } catch (error) {
      console.error('Gemini Chatbot Error:', error);
      throw new Error('Failed to generate chat response');
    }
  }

  // AI Movie Plot & Theme Analysis
  async analyzeMoviePlotAndThemes(movieData) {
    try {
      const { title, overview, genre_names, release_date, vote_average, runtime } = movieData;

      const prompt = `Provide deep analysis of this movie for film enthusiasts and discussion groups.

Movie: "${title}" (${release_date?.split('-')[0]})
Overview: ${overview}
Genres: ${genre_names?.join(', ')}
Rating: ${vote_average}/10
Runtime: ${runtime} minutes

Provide comprehensive analysis in this JSON format:
{
  "themes": {
    "primary": ["Main themes"],
    "secondary": ["Supporting themes"],
    "symbolism": ["Key symbols and metaphors"]
  },
  "character_analysis": {
    "protagonist_journey": "Character development arc",
    "relationships": "Key relationship dynamics",
    "archetypes": "Character archetypes present"
  },
  "cinematography": {
    "style": "Visual style and techniques",
    "mood": "Visual mood and atmosphere",
    "notable_elements": ["Distinctive visual elements"]
  },
  "cultural_context": {
    "historical_period": "Historical context if relevant",
    "social_commentary": "Social issues addressed",
    "cultural_impact": "Cultural significance"
  },
  "discussion_questions": [
    "Thought-provoking questions for movie clubs",
    "Questions about themes and meaning",
    "Questions about character motivations"
  ],
  "similar_films": [
    {
      "title": "Similar Movie",
      "reason": "Why it's similar"
    }
  ],
  "educational_value": "What viewers can learn from this film",
  "rewatch_value": "Why this movie rewards multiple viewings"
}

Focus on meaningful insights that enhance understanding and appreciation of the film.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const cleanedResponse = this.cleanJsonResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Gemini Movie Analysis Error:', error);
      throw new Error('Failed to analyze movie themes and plot');
    }
  }

  // Personalized Movie News & Updates
  async generatePersonalizedNews(userPreferences, movieTrends = []) {
    try {
      const prompt = `Generate personalized movie news and updates for this user.

User Preferences: ${JSON.stringify(userPreferences)}
Current Movie Trends: ${JSON.stringify(movieTrends)}

Create personalized content in this JSON format:
{
  "news_items": [
    {
      "title": "News headline",
      "summary": "Brief summary",
      "relevance": "Why this matters to the user",
      "category": "upcoming_releases/casting_news/industry_updates/recommendations",
      "priority": "high/medium/low"
    }
  ],
  "upcoming_releases": [
    {
      "title": "Movie Title",
      "release_date": "2024-XX-XX",
      "why_interested": "Why the user would be interested",
      "anticipation_level": "high/medium/low"
    }
  ],
  "trending_topics": [
    "Trending topics relevant to user's interests"
  ],
  "recommendations": {
    "watch_tonight": "Movie recommendation for tonight",
    "weekend_binge": "Series/movie series recommendation",
    "exploration": "Something outside their usual taste but worth trying"
  }
}

Focus on content that matches their viewing history and preferences.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const cleanedResponse = this.cleanJsonResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Gemini News Generation Error:', error);
      throw new Error('Failed to generate personalized news');
    }
  }

  // Helper method to clean JSON responses
  cleanJsonResponse(response) {
    // Remove any markdown formatting
    let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find the first { and last } to extract JSON
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    return cleaned;
  }

  // Test method to verify API connection
  async testConnection() {
    try {
      const result = await this.model.generateContent('Say "Gemini AI is connected to XZMovies!" if you can read this.');
      return {
        success: true,
        message: result.response.text()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new GeminiService();
