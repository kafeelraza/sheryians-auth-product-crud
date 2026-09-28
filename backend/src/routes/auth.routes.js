const express = require('express');
const router = express.Router();

const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
} = require('../controllers/auth.controller');

const {
  registerValidator,
  loginValidator,
} = require('../validators/auth.validator');

const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidator, validate, register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & issue tokens
 * @access  Public
 */
router.post('/login', loginValidator, validate, login);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Issue a new access token using refresh token
 * @access  Public (Requires valid refresh token)
 */
router.post('/refresh-token', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Invalidate refresh token and clear cookie
 * @access  Authenticated / Refresh token holder
 */
router.post('/logout', logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Authenticated
 */
router.get('/me', authenticate, getMe);

module.exports = router;
