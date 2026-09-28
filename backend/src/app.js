const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const apiRoutes = require('./routes/index');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// CORS Configuration to allow credentials (cookies) from frontend
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all during development or customize
      }
    },
    credentials: true, // Crucial for sending httpOnly cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser Middleware for reading Refresh Token cookies
app.use(cookieParser());

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Sheryians Coding School - Authentication & Product CRUD API',
    documentation: '/api/health',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
