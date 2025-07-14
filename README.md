# Movie App Backend

A RESTful Express.js API for a movie recommendation app with MongoDB integration.

## Features

- User Authentication (Register/Login with JWT)
- User Profile Management
- Watchlist Management
- Movie Reviews
- Protected Routes with JWT Middleware

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```
MONGODB_URI=mongodb://localhost:27017/movie-app
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

## Running the Application

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/:id` - Get user profile (protected)
- `PATCH /api/users/:id` - Update user profile (protected)
- `DELETE /api/users/:id` - Delete user account (protected)
- `GET /api/users/:id/watchlist` - Get user's watchlist (protected)
- `POST /api/users/:id/watchlist` - Add movie to watchlist (protected)
- `DELETE /api/users/:id/watchlist/:movieId` - Remove movie from watchlist (protected)

### Reviews
- `POST /api/reviews` - Add a review (protected)
- `GET /api/reviews/:movieId` - Get all reviews for a movie
- `GET /api/reviews/user/:userId` - Get user's reviews (protected)
- `PATCH /api/reviews/:id` - Update a review (protected)
- `DELETE /api/reviews/:id` - Delete a review (protected)

### Admin (Admin access required)
- `GET /api/admin/users` - Get all users (admin only)
- `DELETE /api/admin/users/:id` - Delete any user (admin only)
- `GET /api/admin/stats` - Get user statistics (admin only)

## Project Structure

```
backend-movie-app/
├── server.js
├── config/
│   └── database.js
├── models/
│   ├── User.js
│   └── Review.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   └── reviews.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   └── reviewController.js
├── middleware/
│   └── auth.js
└── utils/
    └── generateToken.js
```
