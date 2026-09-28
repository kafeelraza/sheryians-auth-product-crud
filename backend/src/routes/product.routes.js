const express = require('express');
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');

const {
  createProductValidator,
  updateProductValidator,
  mongoIdParamValidator,
} = require('../validators/product.validator');

const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Authenticated
 */
router.post('/', authenticate, createProductValidator, validate, createProduct);

/**
 * @route   GET /api/products
 * @desc    List all products (supports query params: search, category, minPrice, maxPrice, sort, page, limit)
 * @access  Public
 */
router.get('/', getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', mongoIdParamValidator, validate, getProductById);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product by ID
 * @access  Authenticated
 */
router.put('/:id', authenticate, updateProductValidator, validate, updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product by ID
 * @access  Authenticated
 */
router.delete('/:id', authenticate, mongoIdParamValidator, validate, deleteProduct);

module.exports = router;
