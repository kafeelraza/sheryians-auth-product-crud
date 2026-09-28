const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);

// Base API health route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sheryians API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
