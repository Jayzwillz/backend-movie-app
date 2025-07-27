const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// CORS configuration for production and development
// Additional security headers for production
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Request logging middleware for production
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://xzmovies.me',
      'https://www.xzmovies.me',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS policy:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware early
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// Debug middleware specifically for reviews
app.use('/api/reviews', (req, res, next) => {
  console.log('\n🎬 === REVIEWS API REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', {
    authorization: req.headers.authorization ? 'Bearer [TOKEN]' : 'None',
    'content-type': req.headers['content-type']
  });
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  console.log('=================================\n');
  next();
});

app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'XZMovies API is running successfully!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    status: 'healthy',
    version: '1.0.0'
  });
});

// API info route
app.get('/api', (req, res) => {
  res.json({
    name: 'XZMovies API',
    version: '1.0.0',
    description: 'Backend API for XZMovies - Movie Discovery Platform',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      reviews: '/api/reviews',
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

// Global error handler for production
app.use((error, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, error);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
