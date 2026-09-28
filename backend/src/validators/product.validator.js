const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating a product
 */
const createProductValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Title must be between 2 and 120 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number greater than 0'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),

  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer of 0 or more'),

  body('imageUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL format'),
];

/**
 * Validation rules for updating a product
 */
const updateProductValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID format in route parameters'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 2, max: 120 })
    .withMessage('Title must be between 2 and 120 characters'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number greater than 0'),

  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer of 0 or more'),

  body('imageUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL format'),
];

/**
 * Validation rule for checking MongoDB ObjectId in params
 */
const mongoIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID format in route parameters'),
];

module.exports = {
  createProductValidator,
  updateProductValidator,
  mongoIdParamValidator,
};
