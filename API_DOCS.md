# Movie App API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

### User Management

#### Get User Profile
```http
GET /api/users/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "watchlistCount": 5
  }
}
```

#### Update User Profile
```http
PATCH /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

### Watchlist Management

#### Get User's Watchlist
```http
GET /api/users/:id/watchlist
Authorization: Bearer <token>
```

**Response:**
```json
{
  "watchlist": [
    {
      "movieId": "tt1234567",
      "title": "The Movie",
      "poster": "https://example.com/poster.jpg",
      "year": "2023",
      "addedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Add Movie to Watchlist
```http
POST /api/users/:id/watchlist
Authorization: Bearer <token>
Content-Type: application/json

{
  "movieId": "tt1234567",
  "title": "The Movie",
  "poster": "https://example.com/poster.jpg",
  "year": "2023"
}
```

#### Remove Movie from Watchlist
```http
DELETE /api/users/:id/watchlist/:movieId
Authorization: Bearer <token>
```

### Reviews

#### Add Review
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "movieId": "tt1234567",
  "movieTitle": "The Movie",
  "rating": 8,
  "comment": "Great movie! Highly recommended."
}
```

**Response:**
```json
{
  "message": "Review added successfully",
  "review": {
    "id": "review_id",
    "movieId": "tt1234567",
    "movieTitle": "The Movie",
    "rating": 8,
    "comment": "Great movie!",
    "user": {
      "id": "user_id",
      "name": "John Doe"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Movie Reviews
```http
GET /api/reviews/:movieId
```

**Response:**
```json
{
  "movieId": "tt1234567",
  "totalReviews": 3,
  "averageRating": 7.5,
  "reviews": [
    {
      "id": "review_id",
      "rating": 8,
      "comment": "Great movie!",
      "user": {
        "id": "user_id",
        "name": "John Doe"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get User's Reviews
```http
GET /api/reviews/user/:userId
Authorization: Bearer <token>
```

#### Update Review
```http
PATCH /api/reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 9,
  "comment": "Updated review comment"
}
```

#### Delete Review
```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

## Error Responses

### Validation Error
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### Authentication Error
```json
{
  "message": "Access denied. No token provided."
}
```

### Not Found Error
```json
{
  "message": "User not found"
}
```

### Server Error
```json
{
  "message": "Server error"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Testing

You can test the API using tools like:
- Postman
- Thunder Client (VS Code extension)
- curl commands
- The included test script (`test-api.js`)

## Environment Variables

Make sure to set up your `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/movie-app
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```
