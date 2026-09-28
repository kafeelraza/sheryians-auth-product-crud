const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const apiRoutes = require('./routes/index');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser Middleware
app.use(cookieParser());

// API Routes mounted at /api
app.use('/api', apiRoutes);

// Serve Frontend Static Files in Production / when dist exists
const frontendDistPath = path.join(__dirname, '../../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  // Catch-all route to serve index.html for client-side routing
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Fallback API welcome route if frontend is not yet built
  app.get('/', (req, res) => {
    res.json({
      message: 'Sheryians Store API is running',
      documentation: '/api/health',
      version: '1.0.0',
    });
  });
}

// 404 Handler for undefined API routes
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
